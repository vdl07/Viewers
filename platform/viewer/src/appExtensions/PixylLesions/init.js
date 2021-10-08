import csTools from 'cornerstone-tools';
import DICOMSegTempCrosshairsTool from './duplicate/DICOMSegTempCrosshairsTool';
import PixylRemoveLesionMouseTool from './tools/PixylRemoveLesionMouseTool';

/**
 *
 * @param {object} configuration
 * @param {Object|Array} configuration.csToolsConfig
 */
export default function init({ servicesManager, configuration = {} }) {
  csTools.addTool(DICOMSegTempCrosshairsTool);
  csTools.addTool(PixylRemoveLesionMouseTool);
}
