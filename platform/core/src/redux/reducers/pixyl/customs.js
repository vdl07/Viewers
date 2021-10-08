import * as CustomActionTypes from '../../constants/CustomActionTypes';

const defaultState = {
  synchronisedImageIndex: -1,
  viewportBaseIndex: -1,
  isMultipleStackScrollEnabled: false,
};
const pixylCustomsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case CustomActionTypes.CHANGING_STACK_SCROLL:
      return Object.assign({}, state, {
        synchronisedImageIndex: state.isMultipleStackScrollEnabled
          ? action &&
            action.event &&
            action.event.detail &&
            action.event.detail.newImageIdIndex
          : -1,
      });
    case CustomActionTypes.MULTIPLE_STACK_SCROLL:
      return Object.assign({}, state, {
        isMultipleStackScrollEnabled: action.enabled,
        viewportBaseIndex: action.viewportBaseIndex,
      });
    default:
      return state;
  }
};

export default pixylCustomsReducer;
