import ConnectedPixylLesionsPanel from './ConnectedPixylLesionsPanel';
import toolbarModule from './toolbarModule.js';
import React from 'react';
import init from './init.js';

/**
 *
 */
export default {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id: 'pixyl-lesions-extension',

  /**
   * LIFECYCLE HOOKS
   */
  preRegistration({ servicesManager, configuration = {} }) {
    init({ servicesManager, configuration });
  },

  /**
   * MODULE GETTERS
   */
  getPanelModule({ servicesManager, commandsManager, api }) {
    const ExtendedConnectedPixylLesionsPanel = propsIncluded => {
      const { activeContexts } = api.hooks.useAppContext();
      return (
        <ConnectedPixylLesionsPanel
          commandsManager={commandsManager}
          studiesStore={propsIncluded.studies}
          contexts={api.contexts}
          activeContexts={activeContexts}
        />
      );
    };
    const panelModule = {
      menuOptions: [
        {
          icon: 'th-list',
          label: 'Pixyl lesions',
          target: 'pixyl-lesions-panel',
          isDisabled: studies => {
            return false;
          },
        },
      ],
      components: [
        {
          id: 'pixyl-lesions-panel',
          component: ExtendedConnectedPixylLesionsPanel,
        },
      ],
      defaultContext: ['VIEWER'],
    };
    return panelModule;
  },
  getToolbarModule() {
    return toolbarModule;
  },
  // getCommandsModule({ commandsManager }) {
  //   return commandsModule({ commandsManager });
  // },
};
