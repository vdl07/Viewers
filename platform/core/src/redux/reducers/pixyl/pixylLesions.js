import * as PixylLesionsActionType from '../../constants/PixylActionTypes';

const defaultState = {
  pixylLesionLoading: false,
  pixylLesions: undefined,
  pixylLesionLoaded: false,
  pixylLesionError: undefined,
};

const pixylLesions = (state = defaultState, action) => {
  switch (action.type) {
    case PixylLesionsActionType.GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionLoaded: true,
        pixylLesions: action.pixylLesions,
      });
    case PixylLesionsActionType.LOADING_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: true,
      });
    case PixylLesionsActionType.ERROR_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionError: action.error || {},
      });
    case PixylLesionsActionType.SHOW_HIDE_SEGMENTATION: {
      const statePxylLesions = { ...state.pixylLesions };
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
        pixylLesions: { ...statePxylLesions },
      });
    }
    default:
      return state;
  }
};

export default pixylLesions;
