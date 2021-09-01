import React from 'react';
import PropTypes from 'prop-types';

export default class PixylLesionsList extends React.Component {
  static propTypes = {
    pixylLesions: PropTypes.object,
    onClickLesion: PropTypes.func,
  };
  render() {
    const { pixylLesions, onClickLesion } = this.props;
    return (
      <table className="table table--striped table--hoverable">
        <thead className="table-head">
          <tr>
            <th>Lesion ID</th>
            <th>Type</th>
            <th>Volume (mL)</th>
            <th>McDonald region</th>
            <th>Anotomical region</th>
            <th>Vascular territory</th>
            <th>White matter trac</th>
          </tr>
        </thead>
        <tbody className="table-body" data-cy="lesions-list-results">
          {pixylLesions &&
            pixylLesions.lesions &&
            pixylLesions.lesions.map((lesion, index) => {
              return (
                <PixylLesionRow
                  key={index}
                  pixylLesion={lesion}
                  onClickLesion={onClickLesion}
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
  };
  render() {
    const { pixylLesion, onClickLesion } = this.props;
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
        <td>?</td>
        <td>?</td>
        <td>?</td>
      </tr>
    );
  }
}
