import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PixylLesionsPanel from './PixylLesionsPanel';
import { redux } from '@ohif/core';

const { getPixylLesions } = redux.actions;

const mapDispatchToProps = dispatch => ({
  getPixylLesions: bindActionCreators(getPixylLesions, dispatch),
});

function mapStateToProps(state) {
  const { pixylLesions, studies, viewports } = state;
  return { pixylLesions, studies, viewports };
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
export { connectedPixylLesionsPanel as ConnectedPixylLesionsPanel };
