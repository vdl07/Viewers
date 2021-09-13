import { redux } from '@ohif/core';
import store from './../../store';

let multipleStackScrollActivated = false;

const commandsModule = ({ commandsManager }) => {
  const { multipleStackScroll, showHideSegmentation } = redux.actions;

  const actions = {
    enableMultiStackScroll: () => {
      if (!multipleStackScrollActivated) {
        multipleStackScrollActivated = true;
        store.dispatch(multipleStackScroll(true));
      }
    },
    disableMultiStackScroll: () => {
      store.dispatch(multipleStackScroll(false));
      multipleStackScrollActivated = false;
    },
    showHideSegmentationAction: ({ viewports }) => {
      viewports &&
        viewports.activeViewportIndex > -1 &&
        viewports.viewportSpecificData &&
        viewports.viewportSpecificData[viewports.activeViewportIndex] &&
        store.dispatch(
          showHideSegmentation(
            viewports.viewportSpecificData[viewports.activeViewportIndex]
              .SeriesInstanceUID
          )
        );
    },
    showHideAllSegmentation: () => {
      store.dispatch(showHideSegmentation(undefined));
    },
  };

  const definitions = {
    enableMultiStackScroll: {
      commandFn: actions.enableMultiStackScroll,
      storeContexts: ['viewports'],
    },
    disableMultiStackScroll: {
      commandFn: actions.disableMultiStackScroll,
      storeContexts: ['viewports'],
    },
    showHideSegmentation: {
      commandFn: actions.showHideSegmentationAction,
      storeContexts: ['viewports'],
    },
    showHideAllSegmentation: {
      commandFn: actions.showHideAllSegmentation,
      storeContexts: ['viewports'],
    },
  };

  return {
    definitions,
    defaultContext: 'VIEWER',
  };
};

export default commandsModule;
