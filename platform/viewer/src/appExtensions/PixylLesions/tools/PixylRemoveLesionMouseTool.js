import csTools from 'cornerstone-tools';
import { redux } from '@ohif/core';

const BaseTool = csTools.importInternal('base/BaseTool');
const { eraserCursor } = csTools.importInternal('tools/cursors');
const { removeLesionMouseClick } = redux.actions;

export default class PixylRemoveLesionMouseTool extends BaseTool {
  constructor(name = 'PixylRemoveLesionMouse') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      mixins: ['activeOrDisabledBinaryTool'],
      svgCursor: eraserCursor,
    });
  }

  activeCallback(element) {
    //console.log(`Hello element ${element.uuid}!`);
  }

  disabledCallback(element) {
    //console.log(`Goodbye element ${element.uuid}!`);
  }

  preMouseDownCallback(evt) {
    console.log('Hello cornerstoneTools!');
  }

  postMouseDownCallback(evt) {
    const { viewports } = window.store.getState();
    const { commandsManager } = window.ohif.app;
    window.store.dispatch(
      removeLesionMouseClick(
        evt.detail.element,
        evt.detail.event,
        commandsManager,
        viewports
      )
    );
  }
}
