import extensions from './extensions';
import loading from './loading';
import preferences from './preferences';
import servers from './servers';
import studies from './studies';
import timepointManager from './timepointManager';
import viewports from './viewports';
import pixylLesions from './pixyl/pixylLesions';
import pixylCustoms from './pixyl/customs';

const reducers = {
  extensions,
  loading,
  preferences,
  servers,
  studies,
  timepointManager,
  viewports,
  pixylLesions,
  pixylCustoms,
};

export default reducers;
