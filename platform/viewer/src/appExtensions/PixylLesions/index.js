import { ConnectedPixylLesionsPanel } from './ConnectedPixylLesionsPanel';
import toolbarModule from './toolbarModule.js';
import React from 'react';

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

  preRegistration({
    servicesManager = {},
    commandsManager = {},
    appConfig = {},
    configuration = {},
  }) {},

  /**
   * MODULE GETTERS
   */
  getPanelModule({ servicesManager, commandsManager }) {
    const ExtendedConnectedPixylLesionsPanel = () => (
      <ConnectedPixylLesionsPanel commandsManager={commandsManager} />
    );
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
};
