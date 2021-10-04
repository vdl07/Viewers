import extensions from './extensions';
import loading from './loading';
import preferences from './preferences';
import servers from './servers';
import studies from './studies';
import timepointManager from './timepointManager';
import viewports from './viewports';
import pixylAnalysis from './pixyl/pixylAnalysis';
import pixylCustoms from './pixyl/customs';

const reducers = {
  extensions,
  loading,
  preferences,
  servers,
  studies,
  timepointManager,
  viewports,
  pixylAnalysis,
  pixylCustoms,
};

export default reducers;
