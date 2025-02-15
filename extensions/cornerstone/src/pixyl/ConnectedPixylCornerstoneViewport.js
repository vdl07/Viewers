import { PixylCornerstoneViewport } from './PixylCornerstoneViewport';
import { connect } from 'react-redux';

function mapStateToProps(state) {
  const { pixylAnalysis } = state;
  return { pixylAnalysis };
}

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return { ...propsFromDispatch, ...propsFromState, ...ownProps };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {};
};

const ConnectedPixylCornerstoneViewport = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(PixylCornerstoneViewport);
export default ConnectedPixylCornerstoneViewport;
