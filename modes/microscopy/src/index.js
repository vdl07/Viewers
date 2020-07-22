import toolbarButtons from './toolbarButtons.js';
import { hotkeys } from '@ohif/core';

const ohif = {
  layout: 'org.ohif.default.layoutTemplateModule.viewerLayout',
  sopClassHandler: 'org.ohif.default.sopClassHandlerModule.stack',
};
const microscopy = {
  //measurements: 'org.ohif.measurement-tracking.panelModule.trackedMeasurements',
  //thumbnailList: 'org.ohif.measurement-tracking.panelModule.seriesList',
  viewport: 'org.ohif.microscopy.viewportModule.cornerstone-tracked',
};



export default function mode({ modeConfiguration }) {
  return {
    // TODO: We're using this as a route segment
    // We should not be.
    id: 'microscopy',
    displayName: 'Whole-slide Microscopy',
    validationTags: {
      study: [],
      series: [],
    },
    isValidMode: (studyTags, seriesTags) => {
      // All series are welcome in this mode!
      return true;
    },
    routes: [
      {
        path: 'microscopy',
        init: ({ servicesManager, extensionManager }) => {
          const { ToolBarService } = servicesManager.services;
          ToolBarService.init(extensionManager);
          ToolBarService.addButtons(toolbarButtons);
          ToolBarService.createButtonSection('primary', [
            'Zoom',
            'Wwwc',
            'Pan',
            'Capture',
            'Layout',
            'Divider',
            [
              'ResetView',
              'RotateClockwise',
              'FlipHorizontally',
              'StackScroll',
              'Magnify',
              'Invert',
              'Cine',
              'Angle',
              'Probe',
              'RectangleRoi',
            ],
          ]);
          ToolBarService.createButtonSection('secondary', [
            'Annotate',
            'Bidirectional',
            'Ellipse',
            'Length',
            'Clear',
          ]);

          // Could import layout selector here from org.ohif.default (when it exists!)
        },
        layoutTemplate: ({ routeProps }) => {
          return {
            id: ohif.layout,
            props: {
              leftPanels: [tracked.thumbnailList],
              // TODO: Should be optional, or required to pass empty array for slots?
              rightPanels: [tracked.measurements],
              viewports: [
                {
                  namespace: tracked.viewport,
                  displaySetsToDisplay: [ohif.sopClassHandler],
                },
              ],
            },
          };
        },
      },
    ],
    extensions: [
      'org.ohif.default',
      'org.ohif.cornerstone',
      'org.ohif.measurement-tracking',
      'org.ohif.dicom-sr',
    ],
    sopClassHandlers: [ohif.sopClassHandler, dicomsr.sopClassHandler],
    hotkeys: [...hotkeys.defaults.hotkeyBindings],
  };
}

window.longitudinalMode = mode({});