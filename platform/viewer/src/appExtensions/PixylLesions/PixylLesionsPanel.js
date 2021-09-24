import React from 'react';
import PropTypes from 'prop-types';
import { LoadingPanel } from '@ohif/ui';
import PixylLesionsList from './PixylLesionsList';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import DICOMSegTempCrosshairsTool from './duplicate/DICOMSegTempCrosshairsTool';
import { utils, studies } from '@ohif/core';
const { retrieveStudiesMetadata } = studies;
const { studyMetadataManager } = utils;
const scroll = cornerstoneTools.import('util/scroll');

let lastStudyInstanceUIDLoaded = '';

export default class PixylLesionsPanel extends React.Component {
  static propTypes = {
    getPixylLesions: PropTypes.func.isRequired,
    pixylLesions: PropTypes.object,
    studies: PropTypes.object,
    studiesStore: PropTypes.array,
    commandsManager: PropTypes.object,
    viewports: PropTypes.object,
    setViewportActive: PropTypes.func.isRequired,
    setLayout: PropTypes.func.isRequired,
    pixylLesionLoaded: PropTypes.bool,
    setViewportSpecificData: PropTypes.func,
    server: PropTypes.object,
  };

  state = {
    showHideSegmentationStateBySerie: {},
  };

  componentDidUpdate() {
    if (
      this.props.studiesStore &&
      this.props.studiesStore.length > 0 &&
      this.props.studiesStore[0].StudyInstanceUID &&
      lastStudyInstanceUIDLoaded !== this.props.studiesStore[0].StudyInstanceUID
    ) {
      lastStudyInstanceUIDLoaded = this.props.studiesStore[0].StudyInstanceUID;
      const { setViewportSpecificData } = this.props;
      this.props
        .getPixylLesions(this.props.studiesStore)
        .then(msLesionsBySeries => {
          if (!msLesionsBySeries) {
            this.props.setLayout({
              numRows: 1,
              numColumns: 1,
              viewports: [{ plugin: 'cornerstone' }],
            });
            return;
          }
          const seriesSpecificFilters = {
            seriesInstanceUID: Object.keys(msLesionsBySeries).join(','),
          };
          retrieveStudiesMetadata(
            this.props.server,
            [this.props.studiesStore[0].StudyInstanceUID],
            seriesSpecificFilters,
            true
          ).then(result => {
            if (
              result &&
              result.length > 0 &&
              result[0] &&
              result[0].displaySets
            ) {
              const resultMR = result[0].series.filter(f => f.Modality == 'MR');
              resultMR.sort((a, b) => {
                const dateA = a.instances[0].metadata.SeriesDate;
                const dateB = b.instances[0].metadata.SeriesDate;
                const aNumber = Number(`${dateA}`);
                const bNumber = Number(`${dateB}`);
                return aNumber - bNumber;
              });
              if (resultMR.length > 1) {
                const enabledElements = cornerstone.getEnabledElements();
                // [1, 0].forEach(index => {
                //   const enabledElement = enabledElements[index];
                //   if (enabledElement && enabledElement.element) {
                //     let viewport = cornerstone.getViewport(
                //       enabledElement.element
                //     );
                //     const serieIndex = resultMR[index];
                //     const midInstance =
                //       serieIndex.instances[
                //         Math.floor(serieIndex.instances.length / 2)
                //       ];
                //     viewport.voi = {
                //       windowWidth: Number(midInstance.metadata.WindowWidth),
                //       windowCenter: Number(midInstance.metadata.WindowCenter),
                //     };
                //     cornerstone.setViewport(enabledElement.element, viewport);
                //   }
                // });
                this.props.setLayout({
                  numRows: 1,
                  numColumns: 2,
                  viewports: [
                    { plugin: 'cornerstone' },
                    { plugin: 'cornerstone' },
                  ],
                });
                setViewportSpecificData(
                  0,
                  result[0].displaySets.find(
                    f => f.SeriesInstanceUID === resultMR[0].SeriesInstanceUID
                  )
                );
                setViewportSpecificData(
                  1,
                  result[0].displaySets.find(
                    f => f.SeriesInstanceUID === resultMR[1].SeriesInstanceUID
                  )
                );
              }
            }
          });
        });
    }

    if (
      this.props.pixylLesions.pixylLesionLoaded &&
      this.props.pixylLesions.pixylLesions
    ) {
      const seriesUUIDToUpdate = Object.keys(
        this.props.pixylLesions.pixylLesions
      ).filter(s => {
        const lastStateShowSeg =
          this.state.showHideSegmentationStateBySerie[s] &&
          this.state.showHideSegmentationStateBySerie[s].showSegmentation;
        const lastPropsLesionsShowSeg =
          this.props.pixylLesions &&
          this.props.pixylLesions.pixylLesions &&
          this.props.pixylLesions.pixylLesions[s] &&
          this.props.pixylLesions.pixylLesions[s].showSegmentation;
        if (
          (lastStateShowSeg == undefined ? true : lastStateShowSeg) !=
          (lastPropsLesionsShowSeg == undefined
            ? true
            : lastPropsLesionsShowSeg)
        ) {
          return true;
        }
        return false;
      });
      if (seriesUUIDToUpdate.length > 0) {
        const lastState = { ...this.state.showHideSegmentationStateBySerie };
        seriesUUIDToUpdate.forEach(serie => {
          lastState[serie] =
            lastState[serie] === undefined || lastState[serie] === true
              ? false
              : true;
          this.setState({
            showHideSegmentationStateBySerie: { ...lastState },
          });
          this.showHideSegmentation(lastState[serie], undefined, serie);
        });
      }
    }
  }

  render() {
    return this.props.pixylLesions &&
      this.props.pixylLesions.pixylLesionLoading ? (
      <LoadingPanel />
    ) : this.props.pixylLesions &&
      this.props.pixylLesions.pixylLesions &&
      Object.keys(this.props.pixylLesions.pixylLesions).length > 0 ? (
      Object.keys(this.props.pixylLesions.pixylLesions).map(
        (serieUUID, index) => {
          const showHideSegmentationState = this.state
            .showHideSegmentationStateBySerie[serieUUID];
          return (
            <PixylLesionsList
              key={index}
              pixylLesionsSerie={
                this.props.pixylLesions.pixylLesions[serieUUID] || {}
              }
              onClickLesion={segmentNumber =>
                this.focusLesionsOnViewport(segmentNumber, serieUUID)
              }
              onClickChangeVisibilityLesion={(segmentNumber, isVisible) => {
                this.showHideSegmentation(isVisible, segmentNumber, serieUUID);
              }}
              showSegmentationState={
                showHideSegmentationState === undefined ||
                showHideSegmentationState === true
                  ? true
                  : false
              }
            />
          );
        }
      )
    ) : (
      <div></div>
    );
  }

  segmentLabelMatch(metadataRow, segmentNumber) {
    return (
      metadataRow &&
      metadataRow.SegmentLabel &&
      metadataRow.SegmentLabel.includes('' + segmentNumber)
    );
  }

  showHideSegmentation(isVisible, segmentNumber, serieUUID) {
    const { labelmaps3D } = this.getBrushStackState(serieUUID);
    const segmentNumberToHide = [];
    let possibleLabelMaps3D = labelmaps3D;
    if (segmentNumber) {
      segmentNumberToHide.push(segmentNumber);
      possibleLabelMaps3D = labelmaps3D.filter(
        ({ metadata }) =>
          metadata &&
          metadata.data &&
          metadata.data.some(d => this.segmentLabelMatch(d, segmentNumber))
      );
    }

    const hasOneSegmentPerFile = this.hasOneSegmentPerFile(labelmaps3D);

    possibleLabelMaps3D.forEach(labelmap3D => {
      let segmentNumberLocal = segmentNumber;
      if (!segmentNumberLocal) {
        labelmap3D &&
          labelmap3D.metadata &&
          labelmap3D.metadata.data &&
          labelmap3D.metadata.data.forEach(d => {
            let segmentNumberLocalExtract =
              d &&
              ((d.SegmentLabel && d.SegmentLabel.match(/[0-9]+/)) ||
                d.SegmentNumber);
            if (segmentNumberLocalExtract) {
              segmentNumberToHide.push(segmentNumberLocalExtract);
            }
          });
      }
      segmentNumberToHide.forEach(segmentNumberLocal => {
        labelmap3D.segmentsHidden[
          hasOneSegmentPerFile ? 1 : segmentNumberLocal
        ] = !isVisible;
      });
    });

    cornerstone.getEnabledElements().forEach(enabledElement => {
      cornerstone.updateImage(enabledElement.element);
    });
  }

  hasOneSegmentPerFile(maps3D) {
    return maps3D.every(m =>
      m.labelmaps2D.every(d => d.segmentsOnLabelmap.length == 1)
    );
  }

  focusLesionsOnViewport(segmentNumber, serieUUID) {
    const element = this.getEnabledElement(serieUUID);

    const validIndexList = [];
    const maps3D = this.getLabelMaps3D(serieUUID);
    const hasOneSegmentPerFile = this.hasOneSegmentPerFile(maps3D);
    if (hasOneSegmentPerFile) {
      maps3D.forEach((labelMap3D, index3D) => {
        labelMap3D &&
          labelMap3D.labelmaps2D &&
          labelMap3D.metadata &&
          labelMap3D.metadata.data &&
          labelMap3D.metadata.data.some(d =>
            this.segmentLabelMatch(d, segmentNumber)
          ) &&
          labelMap3D.labelmaps2D.forEach((labelMap2D, index) => {
            validIndexList.push({ index2D: index, index3D });
          });
      });
    } else {
      const { labelmaps3D, activeLabelmapIndex } = this.getBrushStackState(
        serieUUID
      );
      const activeLabelMaps2D = labelmaps3D[activeLabelmapIndex].labelmaps2D;
      activeLabelMaps2D.forEach((labelMap2D, index) => {
        if (labelMap2D.segmentsOnLabelmap.includes(segmentNumber)) {
          validIndexList.push({ index2D: index, index3D: activeLabelmapIndex });
        }
      });
    }
    if (validIndexList.length === 0) return;

    const avg = array => array.reduce((a, b) => a + b) / array.length;
    const average = avg(validIndexList.map(v => v.index2D));
    const closest = validIndexList.reduce((prev, curr) => {
      return Math.abs(curr.index2D - average) < Math.abs(prev.index2D - average)
        ? curr
        : prev;
    });

    const toolState = cornerstoneTools.getToolState(element, 'stack');

    if (!toolState) return;

    const imageIds = toolState.data[0].imageIds;
    const imageId = imageIds[closest.index2D];
    const frameIndex = imageIds.indexOf(imageId);

    const SOPInstanceUID = cornerstone.metaData.get('SOPInstanceUID', imageId);
    const StudyInstanceUID = cornerstone.metaData.get(
      'StudyInstanceUID',
      imageId
    );

    DICOMSegTempCrosshairsTool.addCrosshair(
      element,
      imageId,
      hasOneSegmentPerFile ? 1 : segmentNumber,
      closest.index3D
    );

    const data = {
      SOPInstanceUID,
      StudyInstanceUID,
      activeViewportIndex: parseInt(this.getActiveViewportIndex(serieUUID)),
      frameIndex,
      refreshViewports: true,
    };
    this.props.commandsManager.runCommand('jumpToImage', data);
    scroll(element, 1);
    scroll(element, -1);
  }

  getActiveViewportIndex(serieUUID) {
    const viewportIndexFromSerie = Object.keys(
      this.props.viewports.viewportSpecificData
    ).find(
      i =>
        this.props.viewports.viewportSpecificData[i].SeriesInstanceUID ===
        serieUUID
    );
    viewportIndexFromSerie &&
      this.props.setViewportActive(parseInt(viewportIndexFromSerie + ''));
    const index = viewportIndexFromSerie
      ? viewportIndexFromSerie
      : this.props.viewports && this.props.viewports.activeViewportIndex
      ? this.props.viewports.activeViewportIndex
      : 0;
    return index;
  }

  getActiveLabelMaps2D(serieUUID) {
    const { labelmaps2D } = this.getActiveLabelMaps3D(serieUUID);
    return labelmaps2D;
  }

  getActiveLabelMaps3D(serieUUID) {
    const { labelmaps3D, activeLabelmapIndex } = this.getBrushStackState(
      serieUUID
    );
    return labelmaps3D[activeLabelmapIndex];
  }

  getLabelMaps3D(serieUUID) {
    const { labelmaps3D } = this.getBrushStackState(serieUUID);
    return labelmaps3D;
  }

  getActiveViewport(serieUUID) {
    return this.props.viewports.viewportSpecificData[
      this.getActiveViewportIndex(serieUUID)
    ];
  }

  getFirstImageId(serieUUID) {
    const { StudyInstanceUID, displaySetInstanceUID } = this.getActiveViewport(
      serieUUID
    );
    const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
    return studyMetadata.getFirstImageId(displaySetInstanceUID);
  }

  getBrushStackState(serieUUID) {
    const module = cornerstoneTools.getModule('segmentation');
    const firstImageId = this.getFirstImageId(serieUUID);
    const brushStackState = module.state.series[firstImageId];
    return brushStackState;
  }

  getEnabledElement(serieUUID) {
    const enabledElements = cornerstone.getEnabledElements();
    return enabledElements[this.getActiveViewportIndex(serieUUID)].element;
  }

  getEnabledElementByIndex(index) {
    const enabledElements = cornerstone.getEnabledElements();
    return enabledElements[index].element;
  }
}
