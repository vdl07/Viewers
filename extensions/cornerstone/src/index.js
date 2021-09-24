import React from 'react';
import init from './init.js';
import commandsModule from './commandsModule.js';
import toolbarModule from './toolbarModule.js';
import CornerstoneViewportDownloadForm from './CornerstoneViewportDownloadForm';
import { version } from '../package.json';

const Component = React.lazy(() => {
  return import('./OHIFCornerstoneViewport');
});

const Loading = (
  <div
    style={{
      color: 'var(--default-color)',
      fontSize: '30px',
      textAlign: 'center',
      width: '100%',
    }}
  >
    Pixyl analysis is running...
  </div>
);

const OHIFCornerstoneViewport = props => {
  // eslint-disable-next-line react/prop-types
  const customProps = props && props.customProps;
  return !customProps ||
    !customProps.pixylLesions ||
    customProps.pixylLesions.pixylLesionLoaded ? (
    <React.Suspense fallback={Loading}>
      <Component {...props} />
    </React.Suspense>
  ) : (
    Loading
  );
};

/**
 *
 */
export default {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id: 'cornerstone',
  version,

  /**
   *
   *
   * @param {object} [configuration={}]
   * @param {object|array} [configuration.csToolsConfig] - Passed directly to `initCornerstoneTools`
   */
  preRegistration({ servicesManager, configuration = {} }) {
    init({ servicesManager, configuration });
  },
  getViewportModule(store) {
    const { commandsManager } = store;
    const ExtendedOHIFCornerstoneViewport = props => {
      /**
       * TODO: This appears to be used to set the redux parameters for
       * the viewport when new images are loaded. It's very ugly
       * and we should remove it.
       */
      const onNewImageHandler = jumpData => {
        /** Do not trigger all viewports to render unnecessarily */
        jumpData.refreshViewports = false;
        commandsManager.runCommand('jumpToImage', jumpData);
      };
      return (
        <OHIFCornerstoneViewport
          {...props}
          customProps={{
            pixylLesions: commandsManager._getAppState().pixylLesions,
            ...commandsManager._getAppState().pixylCustoms,
          }}
          onNewImage={onNewImageHandler}
        />
      );
    };

    return ExtendedOHIFCornerstoneViewport;
  },
  getToolbarModule() {
    return toolbarModule;
  },
  getCommandsModule({ servicesManager }) {
    return commandsModule({ servicesManager });
  },
};

export { CornerstoneViewportDownloadForm };
