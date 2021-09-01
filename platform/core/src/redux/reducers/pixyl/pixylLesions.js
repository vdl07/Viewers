import * as PixylLesionsActionType from '../../constants/PixylActionTypes';

const defaultState = {
  pixylLesionLoading: false,
  lesions: [],
  pixylLesionLoaded: false,
  pixylLesionError: undefined,
};

const pixylLesions = (state = defaultState, action) => {
  switch (action.type) {
    case PixylLesionsActionType.GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionLoaded: true,
        lesions: action.lesions,
      });
    case PixylLesionsActionType.LOADING_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: true,
      });
    case PixylLesionsActionType.ERROR_GET_PIXYL_LESIONS:
      return Object.assign({}, state, {
        pixylLesionLoading: false,
        pixylLesionError: action.error,
      });
    default:
      return state;
  }
};

export default pixylLesions;
