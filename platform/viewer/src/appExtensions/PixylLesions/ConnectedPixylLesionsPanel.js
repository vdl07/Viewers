import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PixylLesionsPanel from './PixylLesionsPanel';
import { redux } from '@ohif/core';

const {
  getPixylAnalysis,
  setViewportActive,
  setLayout,
  setViewportSpecificData,
  multipleStackScroll,
  removeAddSegmentSegmentation,
} = redux.actions;

const mapDispatchToProps = dispatch => ({
  getPixylAnalysis: bindActionCreators(getPixylAnalysis, dispatch),
  setViewportActive: bindActionCreators(setViewportActive, dispatch),
  multipleStackScroll: bindActionCreators(multipleStackScroll, dispatch),
  removeAddSegmentSegmentation: bindActionCreators(
    removeAddSegmentSegmentation,
    dispatch
  ),
  setLayout: bindActionCreators(setLayout, dispatch),
  setViewportSpecificData: bindActionCreators(
    setViewportSpecificData,
    dispatch
  ),
});

const isActive = a => a.active === true;

function mapStateToProps(state) {
  const { pixylAnalysis, studies, viewports, pixylCustoms } = state;
  const activeServer =
    state.servers && state.servers && state.servers.servers.find(isActive);
  return {
    pixylAnalysis,
    studies,
    viewports,
    server: activeServer,
    pixylCustoms,
  };
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
