import React from 'react';
import init from './init.js';
import commandsModule from './commandsModule.js';
import toolbarModule from './toolbarModule.js';
import CornerstoneViewportDownloadForm from './CornerstoneViewportDownloadForm';
import ConnectedPixylCornerstoneViewport from './pixyl/ConnectedPixylCornerstoneViewport';
import { version } from '../package.json';

const Component = React.lazy(() => {
  return import('./OHIFCornerstoneViewport');
});

const OHIFCornerstoneViewport = props => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
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
      const OHIFComponent = (
        <OHIFCornerstoneViewport
          {...props}
          customProps={{
            pixylLesions: commandsManager._getAppState().pixylLesions,
            ...commandsManager._getAppState().pixylCustoms,
          }}
          onNewImage={onNewImageHandler}
        />
      );
      return <ConnectedPixylCornerstoneViewport BaseViewport={OHIFComponent} />;
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
