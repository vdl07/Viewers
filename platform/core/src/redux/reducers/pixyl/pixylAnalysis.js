import * as PixylLesionsActionType from '../../constants/PixylActionTypes';

const defaultState = {
  pixylLesionLoading: false,
  analysisResults: undefined,
  pixylLesionLoaded: false,
  pixylLesionError: undefined,
  pixylWaitingUploadSegmentation: false,
  pixylAnalysisRunning: false,
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
        }
      }
      return Object.assign({}, state, {
        analysisResults: {
          ...state.analysisResults,
          msLesionsBySerie: { ...statePxylLesions },
        },
      });
    }
    default:
      return state;
  }
};

export default pixylLesions;
