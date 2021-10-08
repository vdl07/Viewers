import * as PixylLesionsActionType from '../../constants/PixylActionTypes';
import cornerstone from 'cornerstone-core';
import cornerstoneTools, { getModule } from 'cornerstone-tools';
import { retrieveStudiesMetadata } from '../../../studies';
import { studyMetadataManager } from '../../../utils';
const { getters } = getModule('segmentation');

const _getSegmentNumberByMouseOver = mouseOverInfos => {
  try {
    if (mouseOverInfos && mouseOverInfos.element && mouseOverInfos.mouseEvent) {
      const element = mouseOverInfos.element;
      const stackToolState = cornerstoneTools.getToolState(element, 'stack');
      const enabledElement = cornerstone.getEnabledElement(element);
      const { columns, imageId } = enabledElement.image;

      if (stackToolState) {
        const labelmap3D = getters.labelmaps3D(element).labelmaps3D[0];
        const imageIds = stackToolState.data[0].imageIds;
        const imageIdIndex = imageIds.findIndex(imgId => imgId === imageId);

        const labelmap2D = labelmap3D.labelmaps2D[imageIdIndex];
        const pixelCoords = cornerstone.pageToPixel(
          enabledElement.element,
          mouseOverInfos.mouseEvent.pageX,
          mouseOverInfos.mouseEvent.pageY
        );
        if (labelmap2D) {
          const { pixelData } = labelmap2D;
          const segmentNumberOver =
            pixelData[
              Math.round(pixelCoords.y) * columns + Math.round(pixelCoords.x)
            ];
          if (segmentNumberOver !== undefined) {
            return {
              segmentNumberOver,
              serieInstanceUID: labelmap3D.metadata.seriesInstanceUid,
            };
          }
        }
      }
    }
    return false;
  } catch (e) {
    console.log(e);
    return;
  }
};

const _getMouseOverSegmentInfos = (mouseOverInfos, pixylAnalysis) => {
  const { segmentNumberOver, serieInstanceUID } =
    _getSegmentNumberByMouseOver(mouseOverInfos) || {};
  const msLesionsSerie =
    pixylAnalysis.analysisResults.msLesionsBySerie[serieInstanceUID];
  const msLesionsMouseOver =
    segmentNumberOver &&
    msLesionsSerie &&
    msLesionsSerie.msLesions &&
    msLesionsSerie.msLesions.find(
      p => p.OHIFSegmentNumber == segmentNumberOver
    );
  return { segmentNumberOver, msLesionsMouseOver };
};

const _segmentLabelMatch = (metadataRow, segmentNumber) => {
  return (
    metadataRow &&
    metadataRow.SegmentNumber &&
    metadataRow.SegmentNumber == segmentNumber
  );
};

const _hasOneSegmentPerFile = maps3D => {
  return maps3D.every(m =>
    m.labelmaps2D.every(d => d.segmentsOnLabelmap.length == 1)
  );
};

const _getEnabledElementByIndex = index => {
  const enabledElements = cornerstone.getEnabledElements();
  return enabledElements[index].element;
};

const _getActiveViewportIndex = (viewports, serieUUID) => {
  const viewportIndexFromSerie = Object.keys(
    viewports.viewportSpecificData
  ).find(
    i => viewports.viewportSpecificData[i].SeriesInstanceUID === serieUUID
  );
  const index = viewportIndexFromSerie
    ? viewportIndexFromSerie
    : viewports && viewports.activeViewportIndex
    ? viewports.activeViewportIndex
    : 0;
  return index;
};

const getActiveViewport = (viewports, serieUUID) => {
  return viewports.viewportSpecificData[
    _getActiveViewportIndex(viewports, serieUUID)
  ];
};

const getFirstImageId = (viewports, serieUUID) => {
  const { StudyInstanceUID, displaySetInstanceUID } = getActiveViewport(
    viewports,
    serieUUID
  );
  const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
  return studyMetadata.getFirstImageId(displaySetInstanceUID);
};

const getBrushStackState = (viewports, serieUUID, element) => {
  if (!serieUUID && element) {
    const labelMapsInfos = getters.labelmaps3D(element);
    serieUUID =
      labelMapsInfos &&
      labelMapsInfos.labelmaps3D &&
      labelMapsInfos.labelmaps3D[0] &&
      labelMapsInfos.labelmaps3D[0].metadata.seriesInstanceUid;
  }
  const module = cornerstoneTools.getModule('segmentation');
  const firstImageId = getFirstImageId(viewports, serieUUID);
  const brushStackState = module.state.series[firstImageId];
  return brushStackState;
};

const showHideSegmentation = (
  isVisible,
  segmentNumber,
  serieUUID,
  newSegmentRemoved,
  commandsManager,
  viewports,
  element
) => {
  const segmentRemoved = newSegmentRemoved;
  const { labelmaps3D } = getBrushStackState(viewports, serieUUID, element);
  let segmentNumberToHide = [];
  let possibleLabelMaps3D = labelmaps3D;
  if (segmentNumber) {
    segmentNumberToHide.push(segmentNumber);
    possibleLabelMaps3D = labelmaps3D.filter(
      ({ metadata }) =>
        metadata &&
        metadata.data &&
        metadata.data.some(d => _segmentLabelMatch(d, segmentNumber))
    );
  }

  const hasOneSegmentPerFile = _hasOneSegmentPerFile(labelmaps3D);

  possibleLabelMaps3D.forEach(labelmap3D => {
    let segmentNumberLocal = segmentNumber;
    if (!segmentNumberLocal) {
      const segmentOnLabelMapExtract = labelmap3D.labelmaps2D.flatMap(
        s2D => s2D.segmentsOnLabelmap
      );
      segmentNumberToHide = [
        ...segmentNumberToHide,
        ...segmentOnLabelMapExtract,
      ];
    }
    [...new Set(segmentNumberToHide)].forEach(segmentNumberLocal => {
      const isHidden =
        !isVisible || segmentRemoved.some(s => s == segmentNumberLocal);
      labelmap3D.segmentsHidden[
        hasOneSegmentPerFile ? 1 : segmentNumberLocal
      ] = isHidden;
    });
  });

  cornerstone.getEnabledElements().forEach(enabledElement => {
    cornerstone.updateImage(enabledElement.element);
  });
};

const defaultState = {
  pixylLesionLoading: false,
  analysisResults: undefined,
  pixylLesionLoaded: false,
  pixylLesionError: undefined,
  pixylWaitingUploadSegmentation: false,
  pixylAnalysisRunning: false,
  segmentOverInfos: undefined,
  segmentsRemoved: [],
  segmentsRemovedHistoric: [[]],
  segmentsRemovedUndoRedoIndex: -1,
};

const pixylLesions = (state = defaultState, action) => {
  switch (action.type) {
    case PixylLesionsActionType.GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionLoaded: true,
        analysisResults: action.analysisResults,
      });
    case PixylLesionsActionType.LOADING_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: true,
      });
    case PixylLesionsActionType.WAITING_PIXYL_ANALYSIS:
      return Object.assign({}, state, {
        pixylAnalysisRunning: true,
        pixylLesionLoading: true,
        analysisResults: action.analysisResults,
      });
    case PixylLesionsActionType.WAITING_UPLOAD_SEGMENTATION:
      return Object.assign({}, state, {
        pixylWaitingUploadSegmentation: true,
      });
    case PixylLesionsActionType.ERROR_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionError: action.error || {},
      });
    case PixylLesionsActionType.SHOW_HIDE_SEGMENTATION: {
      const statePxylLesions = { ...state.analysisResults.msLesionsBySerie };
      for (const seriesInstanceUID in statePxylLesions) {
        if (
          action.seriesInstanceUID === undefined ||
          action.seriesInstanceUID == seriesInstanceUID
        ) {
          const lastStateShowSeg =
            statePxylLesions[seriesInstanceUID]['showSegmentation'];
          statePxylLesions[seriesInstanceUID]['showSegmentation'] =
            lastStateShowSeg === undefined || lastStateShowSeg === true
              ? false
              : true;
          showHideSegmentation(
            statePxylLesions[seriesInstanceUID]['showSegmentation'],
            undefined,
            seriesInstanceUID,
            state.segmentsRemoved,
            action.commandsManager,
            action.viewports,
            action.element
          );
        }
      }
      return Object.assign({}, state, {
        analysisResults: {
          ...state.analysisResults,
          msLesionsBySerie: { ...statePxylLesions },
        },
      });
    }
    case PixylLesionsActionType.SET_MOUSE_OVER_INFOS: {
      const segmentOverInfos = _getMouseOverSegmentInfos(
        {
          element: action.element,
          mouseEvent: action.event,
        },
        state
      );
      if (
        segmentOverInfos &&
        segmentOverInfos.segmentNumberOver &&
        segmentOverInfos.msLesionsMouseOver
      ) {
        return Object.assign({}, state, {
          segmentOverInfos: { ...segmentOverInfos, mouseEvent: action.event },
        });
      }
      return Object.assign({}, state, {
        segmentOverInfos: undefined,
      });
    }
    case PixylLesionsActionType.SET_REMOVE_LESION_BY_MOUSE_CLICK: {
      const segmentOverInfos = _getMouseOverSegmentInfos(
        {
          element: action.element,
          mouseEvent: action.event,
        },
        state
      );
      if (
        segmentOverInfos &&
        segmentOverInfos.segmentNumberOver &&
        action.commandsManager
      ) {
        // commandsManager.runCommand('setSegmentConfiguration', {
        //   segmentNumber: segmentNumber,
        //   visible: false,
        // });
        const newState = Object.assign({}, state, {
          segmentsRemoved: [
            ...state.segmentsRemoved,
            segmentOverInfos.segmentNumberOver,
          ],
          segmentsRemovedHistoric: [
            ...state.segmentsRemovedHistoric,
            state.segmentsRemoved,
          ],
        });
        showHideSegmentation(
          false,
          segmentOverInfos.segmentNumberOver,
          action.serieUUID,
          newState.segmentsRemoved,
          action.commandsManager,
          action.viewports,
          action.element
        );
        return newState;
      }
      return state;
    }
    case PixylLesionsActionType.REMOVE_ADD_SEGMENT_SEGMENTATION: {
      if (action.segmentNumber && action.seriesInstanceUID) {
        const segmentNumber = action.segmentNumber;
        const isSegmentToShowAgain = state.segmentsRemoved.some(
          f => f == segmentNumber
        );
        const newSegmentRemovedList = isSegmentToShowAgain
          ? [...state.segmentsRemoved.filter(f => f != segmentNumber)]
          : [...new Set([...state.segmentsRemoved, segmentNumber])];
        const newState = Object.assign({}, state, {
          segmentsRemoved: [...newSegmentRemovedList],
          segmentsRemovedHistoric: [
            ...state.segmentsRemovedHistoric,
            state.segmentsRemoved,
          ],
        });
        showHideSegmentation(
          isSegmentToShowAgain,
          action.segmentNumber,
          action.seriesInstanceUID,
          newState.segmentsRemoved,
          action.commandsManager,
          action.viewports,
          action.element
        );
        return newState;
      }
      return state;
    }
    // case PixylLesionsActionType.UNDO_REMOVE_ADD_SEGMENT_SEGMENTATION: {
    //   const newIndex = state.segmentsRemovedUndoRedoIndex - 1;
    //   return Object.assign({}, state, {
    //     segmentsRemoved: [...newSegmentRemovedList],
    //     segmentsRemovedHistoric: [
    //       ...state.segmentsRemovedHistoric,
    //       state.segmentsRemoved,
    //     ],
    //   });
    // }
    default:
      return state;
  }
};

export default pixylLesions;
