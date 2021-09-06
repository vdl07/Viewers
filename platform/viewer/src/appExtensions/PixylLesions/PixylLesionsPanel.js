import React from 'react';
import PropTypes from 'prop-types';
import { LoadingPanel } from '@ohif/ui';
import PixylLesionsList from './PixylLesionsList';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import DICOMSegTempCrosshairsTool from './duplicate/DICOMSegTempCrosshairsTool';
import { utils, metadata } from '@ohif/core';
const { studyMetadataManager } = utils;

export default class PixylLesionsPanel extends React.Component {
  static propTypes = {
    getPixylLesions: PropTypes.func.isRequired,
    pixylLesions: PropTypes.object,
    studies: PropTypes.object,
    studiesStore: PropTypes.array,
    commandsManager: PropTypes.object,
    viewports: PropTypes.object,
  };

  componentDidMount() {
    if (this.props.studies.studyData) {
      const firstStudyInstanceUUID = Object.keys(
        this.props.studies.studyData
      )[0];
      this.props.getPixylLesions(firstStudyInstanceUUID);
    }
  }

  render() {
    const { studiesStore } = this.props;
    let serieInstanceUID = undefined;
    let pixylLesionsSerie = {};
    if (
      this.props.viewports &&
      this.props.viewports.viewportSpecificData &&
      this.props.viewports.viewportSpecificData[
        this.props.viewports.activeViewportIndex
      ]
    ) {
      const study = this.props.viewports.viewportSpecificData[
        this.props.viewports.activeViewportIndex
      ];
      serieInstanceUID = study.SeriesInstanceUID;
      if (serieInstanceUID) {
        pixylLesionsSerie =
          this.props.pixylLesions &&
          this.props.pixylLesions.pixylLesions &&
          this.props.pixylLesions.pixylLesions.msLesionsBySerie &&
          this.props.pixylLesions.pixylLesions.msLesionsBySerie[
            serieInstanceUID
          ];
        const segmentationList = this._getReferencedSegDisplaysets(
          study.StudyInstanceUID,
          serieInstanceUID
        );
        segmentationList.forEach((seg, index) => {
          // const studyMetadataSeg = studyMetadataManager.get(
          //   seg.StudyInstanceUID
          // );
          // const firstImageIdSeg = studyMetadataSeg.getFirstImageId(
          //   seg.displaySetInstanceUID
          // );
          // let { stateSegmentation } = cornerstoneTools.getModule(
          //   'segmentation'
          // );
          const referencedDisplaySet = metadata.StudyMetadata.getReferencedDisplaySet(
            seg,
            studiesStore
          );
          // let brushStackState =
          //   stateSegmentation &&
          //   stateSegmentation.series &&
          //   stateSegmentation.series[firstImageIdSeg];
          // const activeLabelmapIndex = brushStackState
          //   ? brushStackState.activeLabelmapIndex
          //   : undefined;
          if (!seg.isLoaded) {
            try {
              seg.load(
                referencedDisplaySet,
                studiesStore,
                index !== segmentationList.length - 1
              );
            } catch (error) {
              seg.isLoaded = false;
              seg.loadError = true;
            }
          }
        });
      }
    }
    return this.props.pixylLesions.pixylLesionLoading ? (
      <LoadingPanel />
    ) : (
      <PixylLesionsList
        pixylLesionsSerie={pixylLesionsSerie || {}}
        onClickLesion={this.focusLesionsOnViewport.bind(this)}
      />
    );
  }

  _getReferencedSegDisplaysets(StudyInstanceUID, SeriesInstanceUID) {
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

  focusLesionsOnViewport(segmentNumber) {
    const element = this.getEnabledElement();

    const validIndexList = [];
    const maps3D = this.getLabelMaps3D();
    const hasOneSegmentPerFile = maps3D.every(m =>
      m.labelmaps2D.every(d => d.segmentsOnLabelmap.length == 1)
    );
    if (hasOneSegmentPerFile) {
      maps3D.forEach((labelMap3D, index3D) => {
        labelMap3D &&
          labelMap3D.labelmaps2D &&
          labelMap3D.metadata &&
          labelMap3D.metadata.data &&
          labelMap3D.metadata.data.some(
            d => d && d.SegmentLabel == `segment ${segmentNumber}`
          ) &&
          labelMap3D.labelmaps2D.forEach((labelMap2D, index) => {
            validIndexList.push({ index2D: index, index3D });
          });
      });
    } else {
      const { labelmaps3D, activeLabelmapIndex } = this.getBrushStackState();
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
      activeViewportIndex: this.getActiveViewportIndex(),
      frameIndex,
    };
    this.props.commandsManager.runCommand('jumpToImage', data);
    this.props.commandsManager.runCommand('jumpToSlice', data);
  }

  getActiveViewportIndex() {
    return this.props.viewports && this.props.viewports.activeViewportIndex
      ? this.props.viewports.activeViewportIndex
      : 0;
  }

  getActiveLabelMaps2D() {
    const { labelmaps2D } = this.getActiveLabelMaps3D();
    return labelmaps2D;
  }

  getActiveLabelMaps3D() {
    const { labelmaps3D, activeLabelmapIndex } = this.getBrushStackState();
    return labelmaps3D[activeLabelmapIndex];
  }

  getLabelMaps3D() {
    const { labelmaps3D } = this.getBrushStackState();
    return labelmaps3D;
  }

  getActiveViewport() {
    return this.props.viewports.viewportSpecificData[
      this.getActiveViewportIndex()
    ];
  }

  getFirstImageId() {
    const {
      StudyInstanceUID,
      displaySetInstanceUID,
    } = this.getActiveViewport();
    const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
    return studyMetadata.getFirstImageId(displaySetInstanceUID);
  }

  getBrushStackState() {
    const module = cornerstoneTools.getModule('segmentation');
    const firstImageId = this.getFirstImageId();
    const brushStackState = module.state.series[firstImageId];
    return brushStackState;
  }

  getEnabledElement() {
    const enabledElements = cornerstone.getEnabledElements();
    return enabledElements[this.getActiveViewportIndex()].element;
  }
}
