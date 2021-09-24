import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@ohif/ui';

export default class PixylLesionsList extends React.Component {
  static propTypes = {
    pixylLesionsSerie: PropTypes.object,
    onClickLesion: PropTypes.func,
    onClickChangeVisibilityLesion: PropTypes.func,
    showSegmentationState: PropTypes.bool,
  };

  render() {
    const {
      pixylLesionsSerie,
      onClickLesion,
      onClickChangeVisibilityLesion,
    } = this.props;
    return (
      <table className="table table--striped table--hoverable">
        <thead className="table-head">
          <tr>
            <th>Lesion ID</th>
            <th>Type</th>
            <th>Volume (mL)</th>
            <th style={{ width: '40%' }}>McDonald region</th>
            <th></th>
            {/* <th>Anotomical region</th>
            <th>Vascular territory</th>
            <th>White matter trac</th> */}
          </tr>
        </thead>
        <tbody className="table-body" data-cy="lesions-list-results">
          {pixylLesionsSerie &&
            pixylLesionsSerie.msLesions &&
            pixylLesionsSerie.msLesions.length > 0 &&
            pixylLesionsSerie.msLesions.map &&
            pixylLesionsSerie.msLesions.map((lesion, index) => {
              return (
                <PixylLesionRow
                  key={index}
                  pixylLesion={lesion}
                  onClickLesion={onClickLesion}
                  onClickChangeVisibilityLesion={onClickChangeVisibilityLesion}
                  showSegmentationState={this.props.showSegmentationState}
                />
              );
            })}
        </tbody>
      </table>
    );
  }
}

class PixylLesionRow extends React.Component {
  static propTypes = {
    pixylLesion: PropTypes.object,
    onClickLesion: PropTypes.func,
    onClickChangeVisibilityLesion: PropTypes.func,
    showSegmentationState: PropTypes.bool,
  };

  state = {
    visible: true,
    showSegmentationState: true,
  };

  componentDidUpdate() {
    if (this.state.showSegmentationState != this.props.showSegmentationState) {
      this.setState({
        showSegmentationState: this.props.showSegmentationState,
        visible: this.props.showSegmentationState,
      });
    }
  }

  render() {
    const {
      pixylLesion,
      onClickLesion,
      onClickChangeVisibilityLesion,
    } = this.props;
    return (
      <tr
        onClick={() => {
          onClickLesion && onClickLesion(pixylLesion.label);
        }}
      >
        <td>{pixylLesion.label}</td>
        <td>{pixylLesion.lesionType}</td>
        <td>
          {pixylLesion.volmm3
            ? pixylLesion.volmm3 > 0
              ? Math.round(pixylLesion.volmm3 * 100) / 100
              : 0
            : '-'}
        </td>
        <td>{pixylLesion.regionMcDo && pixylLesion.regionMcDo.region_name}</td>
        <td>
          <Icon
            className={`eye-icon ${this.state.visible && '--visible'}`}
            name={this.state.visible ? 'eye' : 'eye-closed'}
            width="20px"
            height="20px"
            onClick={() => {
              const newVisibleState = !this.state.visible;
              this.setState({ visible: newVisibleState });
              onClickChangeVisibilityLesion &&
                onClickChangeVisibilityLesion(
                  pixylLesion.label,
                  newVisibleState
                );
            }}
          />
          {/* <button
            title={this.state.visible ? 'Hide' : 'Show'}
            onClick={() => {
              const newVisibleState = !this.state.visible;
              this.setState({ visible: newVisibleState });
              onClickChangeVisibilityLesion &&
                onClickChangeVisibilityLesion(
                  pixylLesion.label,
                  newVisibleState
                );
            }}
          >
            {this.state.visible ? 'Hide' : 'Show'}
          </button> */}
        </td>
        {/* <td>?</td>
        <td>?</td>
        <td>?</td> */}
      </tr>
    );
  }
}
