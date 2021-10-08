import CornerstoneViewport from 'react-cornerstone-viewport';
import OHIF from '@ohif/core';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
import { setEnabledElement } from './state';

const {
  setViewportActive,
  setViewportSpecificData,
  triggerChangingStackScroll,
  setMouseOverInfos,
  setMouseClickInfos,
} = OHIF.redux.actions;
const {
  onAdded,
  onRemoved,
  onModified,
} = OHIF.measurements.MeasurementHandlers;

let timer;
let lastMouseMoveInfos = undefined;
const debounceTooltip = (func, timeout = 1000) => {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// TODO: Transition to enums for the action names so that we can ensure they stay up to date
// everywhere they're used.
const MEASUREMENT_ACTION_MAP = {
  added: onAdded,
  removed: onRemoved,
  modified: throttle(event => {
    return onModified(event);
  }, 300),
};

const mapStateToProps = (state, ownProps) => {
  let dataFromStore;

  // TODO: This may not be updated anymore :thinking:
  if (state.extensions && state.extensions.cornerstone) {
    dataFromStore = state.extensions.cornerstone;
  }

  // If this is the active viewport, enable prefetching.
  const { viewportIndex } = ownProps; //.viewportData;
  const isActive = viewportIndex === state.viewports.activeViewportIndex;
  const viewportSpecificData =
    state.viewports.viewportSpecificData[viewportIndex] || {};

  // CINE
  let isPlaying = false;
  let frameRate = 24;

  if (viewportSpecificData && viewportSpecificData.cine) {
    const cine = viewportSpecificData.cine;

    isPlaying = cine.isPlaying === true;
    frameRate = cine.cineFrameRate || frameRate;
  }

  return {
    // layout: state.viewports.layout,
    isActive,
    // TODO: Need a cleaner and more versatile way.
    // Currently justing using escape hatch + commands
    // activeTool: activeButton && activeButton.command,
    ...dataFromStore,
    isStackPrefetchEnabled: isActive,
    isPlaying,
    frameRate,
    imageIdIndex:
      state.pixylCustoms && state.pixylCustoms.synchronisedImageIndex > -1
        ? parseInt(state.pixylCustoms.synchronisedImageIndex)
        : undefined,
    viewportIndex: viewportIndex,
    ...state.pixylCustoms,
    //stack: viewportSpecificData.stack,
    // viewport: viewportSpecificData.viewport,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { viewportIndex } = ownProps;

  return {
    setViewportActive: () => {
      if (
        ownProps.viewportBaseIndex > -1 &&
        viewportIndex != ownProps.viewportBaseIndex
      ) {
        return;
      }
      console.log(
        'TRUE : ' + viewportIndex + ' LOCK : ' + ownProps.viewportBaseIndex
      );
      dispatch(setViewportActive(viewportIndex));
    },

    setViewportSpecificData: data => {
      dispatch(setViewportSpecificData(viewportIndex, data));
    },

    /**
     * Our component "enables" the underlying dom element on "componentDidMount"
     * It listens for that event, and then emits the enabledElement. We can grab
     * a reference to it here, to make playing with cornerstone's native methods
     * easier.
     */
    onElementEnabled: event => {
      const enabledElement = event.detail.element;
      setEnabledElement(viewportIndex, enabledElement);

      enabledElement.addEventListener('mousemove', function(event) {
        if (lastMouseMoveInfos) {
          lastMouseMoveInfos = undefined;
          dispatch(setMouseOverInfos());
        }
        debounceTooltip(() => {
          lastMouseMoveInfos = event;
          dispatch(setMouseOverInfos(enabledElement, event, event));
        })();
      });
      enabledElement.addEventListener('click', function(event) {
        if (event.altKey) {
          dispatch(setMouseClickInfos(enabledElement, event));
        }
      });
      dispatch(
        setViewportSpecificData(viewportIndex, {
          // TODO: Hack to make sure our plugin info is available from the outset
          plugin: 'cornerstone',
        })
      );
    },

    onMeasurementsChanged: (event, action) => {
      return MEASUREMENT_ACTION_MAP[action](event);
    },

    onStackScrollChanging: (event, ownProps) => {
      dispatch(triggerChangingStackScroll(event, ownProps.viewportIndex));
    },
  };
};

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return {
    ...propsFromState,
    ...propsFromDispatch,
    ...ownProps,
    imageIdIndex: propsFromState.imageIdIndex || ownProps.imageIdIndex,
    eventListeners: [
      {
        target: 'cornerstone',
        eventName: 'cornerstonetoolsstackscroll',
        handler: e => {
          propsFromDispatch.onStackScrollChanging(e, {
            ...ownProps,
            viewportIndex:
              propsFromState.viewportIndex > -1
                ? propsFromState.viewportIndex
                : ownProps.viewportIndex,
          });
        },
      },
    ],
    viewportIndex:
      propsFromState.viewportIndex > -1
        ? propsFromState.viewportIndex
        : ownProps.viewportIndex,
  };
};

const ConnectedCornerstoneViewport = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CornerstoneViewport);

export default ConnectedCornerstoneViewport;
