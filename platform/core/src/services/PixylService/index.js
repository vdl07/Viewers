import utils from '../../utils';
import metadata from '../../classes/metadata';
const { studyMetadataManager } = utils;

export function getPixylLesions(studiesStore) {
  const firstStudyStore = studiesStore[0];
  const studyUUID = firstStudyStore.StudyInstanceUID;
  return window
    .fetch('http://localhost/livaro/study/' + studyUUID)
    .then(res => handleResponse(res))
    .then(resJson => {
      if (!resJson.msLesionsBySerie) {
        return Promise.resolve();
      }
      return resJson.msLesionsBySerie;
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function loadSegmentation(studiesStore, lesionsBySerie) {
  const firstStudyStore = studiesStore[0];
  const studyUUID = firstStudyStore.StudyInstanceUID;
  return new Promise(async (resolve, reject) => {
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
          if (!seg.isLoaded && referencedDisplaySet && studiesStore) {
            try {
              return seg
                .load(
                  referencedDisplaySet,
                  studiesStore,
                  index !== segmentationList.length - 1
                )
                .then(metadataSeg => {
                  lesionsBySerie &&
                    lesionsBySerie[serieInstanceUID] &&
                    lesionsBySerie[serieInstanceUID].msLesions &&
                    lesionsBySerie[serieInstanceUID].msLesions.forEach(e => {
                      const segment = metadataSeg.data.find(
                        f =>
                          f &&
                          f.SegmentLabel &&
                          f.SegmentLabel.includes('' + e.label)
                      );
                      e.lesionType =
                        segment && segment.SegmentLabel.match(/[a-z]+/);
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