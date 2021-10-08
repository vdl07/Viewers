import utils from '../../utils';
import metadata from '../../classes/metadata';
const { studyMetadataManager } = utils;

export function getPixylAnalysis(studiesStore) {
  const firstStudyStore = studiesStore[0];
  const studyUUID = firstStudyStore.StudyInstanceUID;
  return window
    .fetch('http://localhost/livaro/study/' + studyUUID)
    .then(res => handleResponse(res))
    .then(resJson => {
      if (!resJson.msLesionsBySerie) {
        return Promise.resolve();
      }
      return resJson;
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function loadSegmentation(studiesStore, lesionsBySerie) {
  const firstStudyStore = studiesStore[0];
  const studyUUID = firstStudyStore.StudyInstanceUID;
  let failedLoad = false;
  return new Promise(async (resolve, reject) => {
    await sleep(1500);
    for (const serieInstanceUID in lesionsBySerie) {
      let segmentationList = _getReferencedSegDisplaysets(
        studyUUID,
        serieInstanceUID
      );
      if (!segmentationList || segmentationList.length === 0) {
        await sleep(500);
        segmentationList = _getReferencedSegDisplaysets(
          studyUUID,
          serieInstanceUID
        );
      }
      await Promise.all(
        segmentationList.map((seg, index) => {
          const referencedDisplaySet = metadata.StudyMetadata.getReferencedDisplaySet(
            seg,
            studiesStore
          );
          if (referencedDisplaySet && studiesStore) {
            try {
              return seg
                .load(
                  referencedDisplaySet,
                  studiesStore,
                  index !== segmentationList.length - 1
                )
                .then(metadataSeg => {
                  failedLoad = !metadataSeg || !metadataSeg.data;
                  metadataSeg &&
                    metadataSeg.data &&
                    lesionsBySerie &&
                    lesionsBySerie[serieInstanceUID] &&
                    lesionsBySerie[serieInstanceUID].msLesions &&
                    lesionsBySerie[serieInstanceUID].msLesions.forEach(e => {
                      const segment = metadataSeg.data
                        .map(m => {
                          if (!m) {
                            return;
                          }
                          if (m.SegmentLabel.includes('new')) {
                            m.indexSort = 1;
                          } else if (m.SegmentLabel.includes('enlarging')) {
                            m.indexSort = 3;
                          } else {
                            m.indexSort = 2;
                          }
                          return m;
                        })
                        .sort((a, b) => {
                          if (!a || !b) {
                            return 0;
                          }
                          return a.indexSort > b.indexSort
                            ? -1
                            : a.indexSort < b.indexSort
                            ? 1
                            : 0;
                        })
                        .find(
                          f =>
                            f &&
                            f.SegmentLabel &&
                            f.SegmentLabel.includes('' + e.label)
                        );
                      e.lesionType =
                        segment && segment.SegmentLabel.match(/[a-z]+/)[0];
                      e.OHIFSegmentNumber = segment && segment.SegmentNumber;
                    });
                });
            } catch (error) {
              seg.isLoaded = false;
              seg.loadError = true;
              return reject();
            }
          }
        })
      );
    }
    if (failedLoad) {
      await loadSegmentation(studiesStore, lesionsBySerie);
    }
    resolve();
  });
}

function _getReferencedSegDisplaysets(StudyInstanceUID, SeriesInstanceUID) {
  /* Referenced DisplaySets */
  const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
  const referencedDisplaysets = studyMetadata.getDerivedDatasets({
    referencedSeriesInstanceUID: SeriesInstanceUID,
    Modality: 'SEG',
  });

  /* Sort */
  referencedDisplaysets.sort((a, b) => {
    const aNumber = Number(`${a.SeriesDate}${a.SeriesTime}`);
    const bNumber = Number(`${b.SeriesDate}${b.SeriesTime}`);
    return bNumber - aNumber;
  });

  return referencedDisplaysets;
}

function handleResponse(response) {
  return response.text().then(text => {
    let data = undefined;
    try {
      data = text && JSON.parse(text);
    } catch (e) {
      data = text;
    }
    if (!response.ok) {
      const error = data || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}
