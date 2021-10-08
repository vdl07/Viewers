import React from 'react';
import PropTypes from 'prop-types';

export default class PixylSegmentTooltip extends React.Component {
  static propTypes = {
    pixylAnalysis: PropTypes.object.isRequired,
  };

  render() {
    const { pixylAnalysis } = this.props;
    const { segmentNumberOver, msLesionsMouseOver, mouseEvent } =
      (pixylAnalysis && pixylAnalysis.segmentOverInfos) || {};
    return segmentNumberOver && msLesionsMouseOver && mouseEvent ? (
      <div
        id="tooltipLesion"
        className={segmentNumberOver ? 'active' : ''}
        style={{
          left: mouseEvent.pageX ? mouseEvent.pageX - 60 : 0,
          top: mouseEvent.pageY ? mouseEvent.pageY - 40 - 10 : 0,
        }}
      >
        <div>
          <div>Lesion id : {segmentNumberOver}</div>
          {msLesionsMouseOver && (
            <div>Volume : {`${Math.round(msLesionsMouseOver.volmm3)} mL`} </div>
          )}
        </div>
      </div>
    ) : null;
  }
}
