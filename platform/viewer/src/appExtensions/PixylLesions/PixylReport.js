import React from 'react';
import PropTypes from 'prop-types';
import './PixylReport.css';
import { Icon } from '@ohif/ui';

const PIXYL_REPORT_INDICATION = `Evaluation initiale de possible maladie démyélinisante dans un
contexte de déficit neurologique aigu.
Examen de suivi de maladie démyélinisante connue.`;
const PIXYL_REPORT_TECHNIQUE = `A l’étage encéphalique 3D FLAIR.`;
const PIXYL_REPORT_CONCLUSION = `Lésions démyélinisante à dissémination spatiale et temporelle,
évocatrices de SEP.
Maladie démyélinisante en progression.`;

export default class PixylReport extends React.Component {
  static propTypes = {
    msLesionsInfos: PropTypes.object,
    segmentRemoved: PropTypes.array,
  };

  render() {
    return (
      <div className="pixyl-report">
        <div className="logo">
          <Icon name="ohif-logo" className="header-logo-image" />
        </div>
        <div style={{ display: 'inline-table' }}>
          <span>
            <h2>Indication</h2>
            <div>{this.getIndications()}</div>
          </span>
          <span>
            <h2>Technique</h2>
            <div>{this.getTechnique()}</div>
          </span>
          <span>
            <h2>Résultats</h2>
            <div>{this.getResults()}</div>
          </span>
          <span>
            <h2>Conclusions</h2>
            <div>{this.getConclusion()}</div>
          </span>
        </div>
      </div>
    );
  }

  getIndications() {
    return PIXYL_REPORT_INDICATION;
  }

  getTechnique() {
    return PIXYL_REPORT_TECHNIQUE;
  }

  getResults() {
    const { msLesionsInfos, segmentRemoved } = this.props;
    if (!msLesionsInfos) {
      return;
    }
    const { msLesions } = msLesionsInfos;
    const mcDoRegions =
      msLesions &&
      msLesions
        .map(l => l && l.regionMcDo && l.regionMcDo.region_name)
        .filter(l => l);
    const mcDoRegionsDistinct = mcDoRegions && [...new Set(mcDoRegions)];
    const nbMcDoRegionDistinct =
      mcDoRegionsDistinct && mcDoRegionsDistinct.length;
    const newLesions = msLesions.filter(l => l && l.lesionType == 'new');
    const enlargingLesions = msLesions.filter(
      l => l && l.lesionType == 'enlarging'
    );
    const enlargingLesionsWithoutRemoved = enlargingLesions.filter(
      l =>
        !segmentRemoved || !segmentRemoved.some(s => s == l.OHIFSegmentNumber)
    );
    const newLesionsWithoutRemoved = newLesions.filter(
      l =>
        !segmentRemoved || !segmentRemoved.some(s => s == l.OHIFSegmentNumber)
    );
    return `Lésions démyélinisantes concertant ${
      nbMcDoRegionDistinct ? nbMcDoRegionDistinct : 0
    } étages${
      mcDoRegionsDistinct ? ' : ' + mcDoRegionsDistinct.join(',') + '.' : '.'
    }
    L’algorithme Pixyl.Neuro.MS documente une charge
    lésionnelle en progression : ${
      newLesions ? newLesions.length : 0
    } nouvelles lésions, ${enlargingLesions ? enlargingLesions.length : 0} en
    progression, ${(enlargingLesionsWithoutRemoved
      ? enlargingLesionsWithoutRemoved.length
      : 0) +
      (newLesionsWithoutRemoved
        ? newLesionsWithoutRemoved.length
        : 0)} retenues après relecture.`;
  }

  getConclusion() {
    return PIXYL_REPORT_CONCLUSION;
  }
}
