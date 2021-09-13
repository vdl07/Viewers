/** Action Creators:
 *  https://redux.js.org/basics/actions#action-creators
 */

import {
  CLEAR_VIEWPORT,
  SET_ACTIVE_SPECIFIC_DATA,
  SET_SERVERS,
  SET_VIEWPORT,
  SET_VIEWPORT_ACTIVE,
  SET_VIEWPORT_LAYOUT,
  SET_VIEWPORT_LAYOUT_AND_DATA,
  SET_USER_PREFERENCES,
} from './constants/ActionTypes.js';

import {
  ERROR_GET_PIXYL_LESIONS,
  GET_PIXYL_LESIONS,
  LOADING_GET_PIXYL_LESIONS,
  SHOW_HIDE_SEGMENTATION,
} from './constants/PixylActionTypes';
import * as PixylService from '../services/PixylService';
import {
  CHANGING_STACK_SCROLL,
  MULTIPLE_STACK_SCROLL,
} from './constants/CustomActionTypes';

/**
 * The definition of a viewport layout.
 *
 * @typedef {Object} ViewportLayout
 * @property {number} numRows -
 * @property {number} numColumns -
 * @property {array} viewports -
 */

/**
 * VIEWPORT
 */
export const setViewportSpecificData = (
  viewportIndex,
  viewportSpecificData
) => ({
  type: SET_VIEWPORT,
  viewportIndex,
  viewportSpecificData,
});

export const setViewportActive = viewportIndex => ({
  type: SET_VIEWPORT_ACTIVE,
  viewportIndex,
});

/**
 * @param {ViewportLayout} layout
 */
export const setLayout = ({ numRows, numColumns, viewports }) => ({
  type: SET_VIEWPORT_LAYOUT,
  numRows,
  numColumns,
  viewports,
});

/**
 * @param {number} layout.numRows
 * @param {number} layout.numColumns
 * @param {array} viewports
 */
export const setViewportLayoutAndData = (
  { numRows, numColumns, viewports },
  viewportSpecificData
) => ({
  type: SET_VIEWPORT_LAYOUT_AND_DATA,
  numRows,
  numColumns,
  viewports,
  viewportSpecificData,
});

export const clearViewportSpecificData = viewportIndex => ({
  type: CLEAR_VIEWPORT,
  viewportIndex,
});

export const setActiveViewportSpecificData = viewportSpecificData => ({
  type: SET_ACTIVE_SPECIFIC_DATA,
  viewportSpecificData,
});

/**
 * NOT-VIEWPORT
 */
export const setStudyLoadingProgress = (progressId, progressData) => ({
  type: 'SET_STUDY_LOADING_PROGRESS',
  progressId,
  progressData,
});

export const clearStudyLoadingProgress = progressId => ({
  type: 'CLEAR_STUDY_LOADING_PROGRESS',
  progressId,
});

export const setUserPreferences = state => ({
  type: SET_USER_PREFERENCES,
  state,
});

export const setExtensionData = (extension, data) => ({
  type: 'SET_EXTENSION_DATA',
  extension,
  data,
});

export const setTimepoints = state => ({
  type: 'SET_TIMEPOINTS',
  state,
});

export const setMeasurements = state => ({
  type: 'SET_MEASUREMENTS',
  state,
});

export const setStudyData = (StudyInstanceUID, data) => ({
  type: 'SET_STUDY_DATA',
  StudyInstanceUID,
  data,
});

export const setServers = servers => ({
  type: SET_SERVERS,
  servers,
});

export const getPixylLesions = study => {
  return dispatch => {
    dispatch({ type: LOADING_GET_PIXYL_LESIONS });
    return PixylService.getPixylLesions(study)
      .then(res => {
        dispatch({ type: GET_PIXYL_LESIONS, pixylLesions: res });
        return;
      })
      .catch(e => {
        dispatch({ type: ERROR_GET_PIXYL_LESIONS });
        return Promise.reject(e);
      });
  };
};

export const triggerChangingStackScroll = (event, viewportBaseIndex) => {
  return { type: CHANGING_STACK_SCROLL, event, viewportBaseIndex };
};

export const multipleStackScroll = enabled => {
  return { type: MULTIPLE_STACK_SCROLL, enabled };
};

export const showHideSegmentation = seriesInstanceUID => {
  return { type: SHOW_HIDE_SEGMENTATION, seriesInstanceUID };
};

const actions = {
  /**
   * VIEWPORT
   */
  setViewportActive,
  setViewportSpecificData,
  setViewportLayoutAndData,
  setLayout,
  clearViewportSpecificData,
  setActiveViewportSpecificData,
  /**
   * NOT-VIEWPORT
   */
  setStudyLoadingProgress,
  clearStudyLoadingProgress,
  setUserPreferences,
  setExtensionData,
  setTimepoints,
  setMeasurements,
  setStudyData,
  setServers,
  /**
   * EXTENSIONS
   */
  getPixylLesions,
  triggerChangingStackScroll,
  multipleStackScroll,
  showHideSegmentation,
};

export default actions;
