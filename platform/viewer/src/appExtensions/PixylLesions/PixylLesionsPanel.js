import React from 'react';
import PropTypes from 'prop-types';
import { LoadingPanel } from '@ohif/ui';
import PixylLesionsList from './PixylLesionsList';
import PixylPanelGroup from './PixylPanelGroup';
import PixylReport from './PixylReport';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import DICOMSegTempCrosshairsTool from './duplicate/DICOMSegTempCrosshairsTool';
import PixylSegmentTooltip from './PixylSegmentTooltip';
import { utils, studies } from '@ohif/core';
const { retrieveStudiesMetadata } = studies;
const { studyMetadataManager } = utils;
const scroll = cornerstoneTools.import('util/scroll');

let lastStudyInstanceUIDLoaded = '';
let timerUnlockViewportFocus = undefined;

export default class PixylLesionsPanel extends React.Component {
  static propTypes = {
    getPixylAnalysis: PropTypes.func.isRequired,
    pixylAnalysis: PropTypes.object,
    pixylCustoms: PropTypes.object,
    studies: PropTypes.object,
    studiesStore: PropTypes.array,
    commandsManager: PropTypes.object,
    viewports: PropTypes.object,
    setViewportActive: PropTypes.func.isRequired,
    setLayout: PropTypes.func.isRequired,
    pixylLesionLoaded: PropTypes.bool,
    setViewportSpecificData: PropTypes.func,
    server: PropTypes.object,
    activeContexts: PropTypes.arrayOf(PropTypes.string),
    contexts: PropTypes.object,
    multipleStackScroll: PropTypes.func,
    removeAddSegmentSegmentation: PropTypes.func,
  };

  isVTK() {
    return this.props.activeContexts.includes(this.props.contexts.VTK);
  }
  isCornerstone() {
    return this.props.activeContexts.includes(this.props.contexts.CORNERSTONE);
  }

  state = {
    selectedSerieUUID: undefined,
    isReportMode: false,
  };

  componentDidUpdate() {
    if (
      this.props.studiesStore &&
      this.props.studiesStore.length > 0 &&
      this.props.studiesStore[0].StudyInstanceUID &&
      lastStudyInstanceUIDLoaded !== this.props.studiesStore[0].StudyInstanceUID
    ) {
      const action = this.props.setLayout({
        numRows: 1,
        numColumns: 1,
        viewports: [{ plugin: 'cornerstone' }],
      });
      window.store.dispatch(action);
      lastStudyInstanceUIDLoaded = this.props.studiesStore[0].StudyInstanceUID;
      // const { setViewportSpecificData } = this.props;
      this.props
        .getPixylAnalysis(this.props.studiesStore)
        .then(pixylAnalysis => {
          if (!pixylAnalysis || !pixylAnalysis.msLesionsBySerie) {
            this.props.setLayout({
              numRows: 1,
              numColumns: 1,
              viewports: [{ plugin: 'cornerstone' }],
            });
            return;
          }
          const seriesSpecificFilters = {
            seriesInstanceUID: Object.keys(pixylAnalysis.msLesionsBySerie).join(
              ','
            ),
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
              if (Object.keys(pixylAnalysis.msLesionsBySerie).length > 1) {
                this.props.setLayout({
                  numRows: 1,
                  numColumns: 2,
                  viewports: [
                    { plugin: 'cornerstone' },
                    { plugin: 'cornerstone' },
                  ],
                });
              }
            }
          });
        });
    }

    if (
      this.props.pixylAnalysis.pixylLesionLoaded &&
      this.props.pixylAnalysis.analysisResults &&
      this.props.pixylAnalysis.analysisResults.msLesionsBySerie
    ) {
      let indexSerieToFocus = 0;
      const serieUUIDPixyl = Object.keys(
        this.props.pixylAnalysis.analysisResults.msLesionsBySerie
      );
      if (
        this.props &&
        this.props.viewports &&
        this.props.viewports.viewportSpecificData
      ) {
        const dataViewportFocus = this.props.viewports.viewportSpecificData[
          this.props.viewports.activeViewportIndex
        ];
        const indexMatch = serieUUIDPixyl.findIndex(
          f => f == dataViewportFocus.SeriesInstanceUID
        );
        if (indexMatch > -1) {
          indexSerieToFocus = indexMatch;
        }
      }
      const newSerieToFocus = Object.keys(
        this.props.pixylAnalysis.analysisResults.msLesionsBySerie
      )[indexSerieToFocus];
      this.state.selectedSerieUUID !== newSerieToFocus &&
        this.setState({
          ...this.state,
          selectedSerieUUID: newSerieToFocus,
        });
    }
  }

  render() {
    const { pixylAnalysis } = this.props;
    if (pixylAnalysis && pixylAnalysis.pixylLesionLoading) {
      return <LoadingPanel />;
    } else {
      if (
        pixylAnalysis &&
        pixylAnalysis.analysisResults &&
        pixylAnalysis.analysisResults.msLesionsBySerie &&
        Object.keys(pixylAnalysis.analysisResults.msLesionsBySerie).length > 0
      ) {
        const msLesionsBySerie = pixylAnalysis.analysisResults.msLesionsBySerie;
        const serieUUIDList = Object.keys(msLesionsBySerie);
        const selectedSerieUUID = this.state.selectedSerieUUID;
        const msLesionsSerie = msLesionsBySerie[selectedSerieUUID] || {};
        const serieUUIDLastVisit = Object.keys(
          pixylAnalysis.analysisResults.msLesionsBySerie
        ).find(
          f =>
            pixylAnalysis.analysisResults.msLesionsBySerie[f].isSerieLastVisit
        );
        return (
          <>
            {serieUUIDList.length > 1 && (
              <PixylPanelGroup
                selectedSerieUUID={selectedSerieUUID}
                isReportMode={this.state.isReportMode}
                viewports={this.props.viewports}
                msLesionsBySerie={msLesionsBySerie}
                onClickPanelGroupItem={(serieUUID, index) => {
                  this.setState({
                    ...this.state,
                    selectedSerieUUID: serieUUID,
                    isReportMode: false,
                  });
                  this.props.setViewportActive(index);
                }}
                onClickPanelGroupItemReport={() => {
                  this.setState({ ...this.state, isReportMode: true });
                }}
              />
            )}
            {this.state.isReportMode && serieUUIDLastVisit ? (
              <PixylReport
                segmentRemoved={this.props.pixylAnalysis.segmentsRemoved}
                msLesionsInfos={
                  pixylAnalysis.analysisResults.msLesionsBySerie[
                    serieUUIDLastVisit
                  ]
                }
              />
            ) : (
              <PixylLesionsList
                pixylLesionsSerie={msLesionsSerie}
                onClickLesion={segmentNumber => {
                  this.focusLesionsOnViewport(segmentNumber, selectedSerieUUID);
                }}
                onClickChangeVisibilityLesion={(segmentNumber, isVisible) => {
                  this.props.removeAddSegmentSegmentation(
                    segmentNumber,
                    this.props.commandsManager,
                    this.props.viewports,
                    selectedSerieUUID
                  );
                  this.props.commandsManager.runCommand(
                    'setSegmentConfiguration',
                    {
                      segmentNumber,
                      visible:
                        this.props.pixylAnalysis.segmentsRemoved &&
                        this.props.pixylAnalysis.segmentsRemoved.some(
                          s => s === segmentNumber
                        ),
                    }
                  );
                }}
                segmentRemoved={this.props.pixylAnalysis.segmentsRemoved}
              />
            )}
            <PixylSegmentTooltip
              pixylAnalysis={pixylAnalysis}
              pixylCustoms={this.props.pixylCustoms}
            />
          </>
        );
      } else {
        return <div></div>;
      }
    }
  }

  focusLesionsOnViewport(segmentNumber, serieUUIDBase) {
    let focusSync = undefined;
    const seriesUUIDList = Object.keys(
      this.props.pixylAnalysis.analysisResults.msLesionsBySerie
    );
    const isMPRActivated = this.isVTK();
    if (!isMPRActivated) {
      timerUnlockViewportFocus && clearTimeout(timerUnlockViewportFocus);
      this.props.multipleStackScroll(
        false,
        parseInt(this._getActiveViewportIndex(serieUUIDBase))
      );
    }
    const dataToFocus = (isMPRActivated ? [serieUUIDBase] : seriesUUIDList).map(
      serieUUID => {
        const maps3D = this.getLabelMaps3D(serieUUID);
        const hasOneSegmentPerFile = this._hasOneSegmentPerFile(maps3D);
        const specificFrameIndex = focusSync && focusSync.frameIndex;
        const closest = specificFrameIndex
          ? { index2D: specificFrameIndex }
          : this._getClosestImageIndex2D3D(
              serieUUID,
              segmentNumber,
              hasOneSegmentPerFile,
              maps3D
            );
        if (!closest) {
          return;
        }

        if (this.isCornerstone()) {
          const element = this._getEnabledElement(serieUUID);
          const toolState = cornerstoneTools.getToolState(element, 'stack');
          if (!toolState) return;

          const imageIds = toolState.data[0].imageIds;
          const imageId = imageIds[closest.index2D];
          const frameIndex = imageIds.indexOf(imageId);

          const centroid = this._addCrosshair(
            element,
            imageId,
            closest.index3D,
            hasOneSegmentPerFile ? 1 : segmentNumber,
            focusSync && focusSync.centroid
          );

          const SOPInstanceUID = cornerstone.metaData.get(
            'SOPInstanceUID',
            imageId
          );
          const StudyInstanceUID = cornerstone.metaData.get(
            'StudyInstanceUID',
            imageId
          );

          const data = {
            SOPInstanceUID,
            StudyInstanceUID,
            activeViewportIndex: parseInt(
              this._getActiveViewportIndex(serieUUID)
            ),
            frameIndex,
            refreshViewports: true,
          };
          focusSync = { frameIndex, centroid };
          return { data, element, serieUUID };
        }

        if (isMPRActivated) {
          const labelMaps3D = this.getActiveLabelMaps3D(serieUUID);
          const currentDisplaySet = this._getCurrentDisplaySet(serieUUID);
          const frame = labelMaps3D.labelmaps2D[closest.index2D];
          const data = {
            studies: this.props.studiesStore,
            StudyInstanceUID: currentDisplaySet.StudyInstanceUID,
            displaySetInstanceUID: currentDisplaySet.displaySetInstanceUID,
            SOPClassUID: this.getActiveViewport(serieUUID).sopClassUIDs[0],
            SOPInstanceUID: currentDisplaySet.SOPInstanceUID,
            segmentNumber,
            frameIndex: closest.index2D,
            frame,
          };
          return { data };
        }
        return undefined;
      }
    );
    //order by serie to update the clicked serie at last
    dataToFocus &&
      dataToFocus
        .filter(f => (f ? true : false))
        .sort(s => (s.serieUUID === serieUUIDBase ? 1 : 0))
        .forEach(({ data, element }) => {
          if (this.isVTK()) {
            this.props.commandsManager.runCommand('jumpToSlice', data);
          } else {
            this.props.commandsManager.runCommand('jumpToImage', data);
            scroll(element, 1);
            scroll(element, -1);
          }
        });
    if (!isMPRActivated) {
      timerUnlockViewportFocus = setTimeout(() => {
        this.props.multipleStackScroll(false, -1);
      }, 250);
    }
  }

  _segmentLabelMatch(metadataRow, segmentNumber) {
    return (
      metadataRow &&
      metadataRow.SegmentNumber &&
      metadataRow.SegmentNumber == segmentNumber
    );
  }

  _hasOneSegmentPerFile(maps3D) {
    return maps3D.every(m =>
      m.labelmaps2D.every(d => d.segmentsOnLabelmap.length == 1)
    );
  }

  _addCrosshair(element, imageId, index3D, segmentNumber, centroid) {
    if (centroid) {
      DICOMSegTempCrosshairsTool.addCrosshairByCentroid(
        centroid,
        element,
        imageId
      );
      return centroid;
    } else {
      return DICOMSegTempCrosshairsTool.addCrosshair(
        element,
        imageId,
        segmentNumber,
        index3D
      );
    }
  }

  _getClosestImageIndex2D3D(
    serieUUID,
    segmentNumber,
    hasOneSegmentPerFile,
    maps3D
  ) {
    const validIndexList = [];
    if (hasOneSegmentPerFile) {
      maps3D.forEach((labelMap3D, index3D) => {
        labelMap3D &&
          labelMap3D.labelmaps2D &&
          labelMap3D.metadata &&
          labelMap3D.metadata.data &&
          labelMap3D.metadata.data.some(d =>
            this._segmentLabelMatch(d, segmentNumber)
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
          validIndexList.push({
            index2D: index,
            index3D: activeLabelmapIndex,
          });
        }
      });
    }
    if (validIndexList.length === 0) return;

    const avg = array => array.reduce((a, b) => a + b) / array.length;
    const average = avg(validIndexList.map(v => v.index2D));
    return validIndexList.reduce((prev, curr) => {
      return Math.abs(curr.index2D - average) < Math.abs(prev.index2D - average)
        ? curr
        : prev;
    });
  }

  _getActiveViewportIndex(serieUUID) {
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

  _getCurrentDisplaySet(serieUUID) {
    const { StudyInstanceUID, displaySetInstanceUID } = this.getActiveViewport(
      serieUUID
    );
    const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
    const allDisplaySets = studyMetadata.getDisplaySets();
    return allDisplaySets.find(
      ds => ds.displaySetInstanceUID === displaySetInstanceUID
    );
  }

  _getActiveLabelMaps2D(serieUUID) {
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
      this._getActiveViewportIndex(serieUUID)
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

  _getEnabledElement(serieUUID) {
    const enabledElements = cornerstone.getEnabledElements();
    return enabledElements[this._getActiveViewportIndex(serieUUID)].element;
  }

  _getEnabledElementByIndex(index) {
    const enabledElements = cornerstone.getEnabledElements();
    return enabledElements[index].element;
  }
}
