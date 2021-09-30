import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PixylLesionsPanel from './PixylLesionsPanel';
import { redux } from '@ohif/core';

const {
  getPixylLesions,
  setViewportActive,
  setLayout,
  setViewportSpecificData,
} = redux.actions;

const mapDispatchToProps = dispatch => ({
  getPixylLesions: bindActionCreators(getPixylLesions, dispatch),
  setViewportActive: bindActionCreators(setViewportActive, dispatch),

  setLayout: bindActionCreators(setLayout, dispatch),
  setViewportSpecificData: bindActionCreators(
    setViewportSpecificData,
    dispatch
  ),
});

const isActive = a => a.active === true;

function mapStateToProps(state) {
  const { pixylLesions, studies, viewports } = state;
  const activeServer =
    state.servers && state.servers && state.servers.servers.find(isActive);
  return { pixylLesions, studies, viewports, server: activeServer };
}

/**
 * Merge ConnectedPixylLesionsPanel props to PixylLesionsPanel
 */
const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return { ...propsFromDispatch, ...propsFromState, ...ownProps };
};

const connectedPixylLesionsPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(PixylLesionsPanel);
export default connectedPixylLesionsPanel;
