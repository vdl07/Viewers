import React from 'react';
import PropTypes from 'prop-types';
import { LoadingPanel } from '@ohif/ui';
import PixylLesionsList from './PixylLesionsList';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import DICOMSegTempCrosshairsTool from './duplicate/DICOMSegTempCrosshairsTool';
import { utils } from '@ohif/core';
const { studyMetadataManager } = utils;

export default class PixylLesionsPanel extends React.Component {
  static propTypes = {
    getPixylLesions: PropTypes.func.isRequired,
    pixylLesions: PropTypes.object,
    studies: PropTypes.object,
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
    const { commandsManager } = this.props;
    return this.props.pixylLesions.pixylLesionLoading ? (
      <LoadingPanel />
    ) : (
      <PixylLesionsList
        pixylLesions={this.props.pixylLesions}
        onClickLesion={segmentNumber => {
          const element = this.getEnabledElement();

          const validIndexList = [];
          this.getActiveLabelMaps2D().forEach((labelMap2D, index) => {
            if (labelMap2D.segmentsOnLabelmap.includes(segmentNumber)) {
              validIndexList.push(index);
            }
          });

          if (validIndexList.length === 0) return;

          const avg = array => array.reduce((a, b) => a + b) / array.length;
          const average = avg(validIndexList);
          const closest = validIndexList.reduce((prev, curr) => {
            return Math.abs(curr - average) < Math.abs(prev - average)
              ? curr
              : prev;
          });

          const toolState = cornerstoneTools.getToolState(element, 'stack');

          if (!toolState) return;

          const imageIds = toolState.data[0].imageIds;
          const imageId = imageIds[closest];
          const frameIndex = imageIds.indexOf(imageId);

          const SOPInstanceUID = cornerstone.metaData.get(
            'SOPInstanceUID',
            imageId
          );
          const StudyInstanceUID = cornerstone.metaData.get(
            'StudyInstanceUID',
            imageId
          );

          DICOMSegTempCrosshairsTool.addCrosshair(
            element,
            imageId,
            segmentNumber
          );

          const data = {
            SOPInstanceUID,
            StudyInstanceUID,
            activeViewportIndex: this.getActiveViewportIndex(),
            frameIndex,
          };
          commandsManager.runCommand('jumpToImage', data);
          commandsManager.runCommand('jumpToSlice', data);
        }}
      />
    );
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
