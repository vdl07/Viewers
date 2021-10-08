import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@ohif/ui';
import './PixylLesions.css';

export default class PixylLesionsList extends React.Component {
  static propTypes = {
    pixylLesionsSerie: PropTypes.object,
    onClickLesion: PropTypes.func,
    onClickChangeVisibilityLesion: PropTypes.func,
    showSegmentationState: PropTypes.bool,
    segmentRemoved: PropTypes.array,
  };

  render() {
    const {
      pixylLesionsSerie,
      onClickLesion,
      onClickChangeVisibilityLesion,
    } = this.props;
    return (
      <table className="table table--striped table--hoverable pixylLesionsTab">
        <thead className="table-head">
          <tr>
            {/* <th>Lesion ID</th> */}
            <th style={{ maxWidth: '45px' }}>Type</th>
            <th style={{ maxWidth: '75px' }}>Vol. (mL)</th>
            <th>Région McDonald</th>
            <th style={{ maxWidth: '45px' }}></th>
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
            pixylLesionsSerie.msLesions
              .filter(f => f && f.lesionType)
              .map(m => {
                if (!m) {
                  return;
                }
                if (m.lesionType.includes('new')) {
                  m.indexSort = 3;
                } else if (m.lesionType.includes('enlarging')) {
                  m.indexSort = 2;
                } else {
                  m.indexSort = 1;
                }
                return m;
              })
              .sort((a, b) => {
                if (!a || !b) {
                  return 0;
                }
                return a.indexSort > b.indexSort
                  ? -1
                  : a.indexSort < b.indexSort
                  ? 1
                  : 0;
              })
              .map((lesion, index) => {
                return (
                  <PixylLesionRow
                    key={index}
                    pixylLesion={lesion}
                    onClickLesion={onClickLesion}
                    onClickChangeVisibilityLesion={
                      onClickChangeVisibilityLesion
                    }
                    showSegmentationState={this.props.showSegmentationState}
                    segmentRemoved={this.props.segmentRemoved}
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
    segmentRemoved: PropTypes.array,
  };

  state = {
    visible: true,
    showSegmentationState: true,
  };

  componentDidUpdate() {
    // if (this.state.showSegmentationState != this.props.showSegmentationState) {
    //   this.setState({
    //     showSegmentationState: this.props.showSegmentationState,
    //     visible: this.props.showSegmentationState,
    //   });
    // }
  }

  render() {
    const {
      pixylLesion,
      onClickLesion,
      onClickChangeVisibilityLesion,
    } = this.props;
    let backgroundColorLesion = undefined;
    switch (pixylLesion.lesionType) {
      case 'new':
        backgroundColorLesion = '#EB1A5B';
        break;
      case 'enlarging':
        backgroundColorLesion = '#FED307';
        break;
      case 'stable':
        backgroundColorLesion = '#6DCFF6';
        break;
      default:
        pixylLesion.lesionType = 'cross';
        backgroundColorLesion = '#77C371';
    }
    const lesionTypeComponent = (
      <div
        className="segment-color"
        style={{
          backgroundColor: backgroundColorLesion,
          width: '16px',
          height: '16px',
        }}
        title={pixylLesion.lesionType}
      ></div>
    );
    return (
      <tr
        className="pixylLesion"
        onClick={() => {
          onClickLesion &&
            onClickLesion(pixylLesion.OHIFSegmentNumber || pixylLesion.label);
        }}
      >
        {/* <td>{pixylLesion.label}</td> */}
        <td style={{ maxWidth: '45px' }}>{lesionTypeComponent}</td>
        <td style={{ maxWidth: '75px' }}>
          {pixylLesion.volmm3
            ? pixylLesion.volmm3 > 0
              ? Math.round(pixylLesion.volmm3)
              : 0
            : '-'}
        </td>
        <td>{pixylLesion.regionMcDo && pixylLesion.regionMcDo.region_name}</td>
        <td style={{ maxWidth: '45px' }}>
          {pixylLesion.OHIFSegmentNumber && (
            <button>
              <Icon
                className={`eye-icon ${this.state.visible && '--visible'}`}
                name={
                  this.props.segmentRemoved &&
                  this.props.segmentRemoved.some(
                    s => s == pixylLesion.OHIFSegmentNumber
                  )
                    ? 'eye-closed'
                    : 'eye'
                }
                width="20px"
                height="20px"
                onClick={() => {
                  const newVisibleState = !this.state.visible;
                  this.setState({ visible: newVisibleState });
                  onClickChangeVisibilityLesion &&
                    onClickChangeVisibilityLesion(
                      pixylLesion.OHIFSegmentNumber || pixylLesion.label,
                      newVisibleState
                    );
                }}
              />
            </button>
          )}
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
