import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
export class PixylCornerstoneViewport extends React.Component {
  static propTypes = {
    BaseViewport: PropTypes.object,
    pixylAnalysis: PropTypes.object,
  };

  render() {
    const props = this.props;
    const { BaseViewport, pixylAnalysis } = props;
    if (pixylAnalysis) {
      const {
        pixylLesionLoading,
        pixylWaitingUploadSegmentation,
        pixylLesionError,
        pixylAnalysisRunning,
      } = pixylAnalysis;
      const {
        patientIdentification,
        visitDate,
        visitDateRefAnalysis,
        isLongitudinal,
      } = pixylAnalysis.analysisResults || {};
      if (pixylLesionError) {
        return BaseViewport;
        //return <div>{"Error loading Pixyl's lesions"}</div>;
      }
      let isLoading = false;
      let loadingMessage = undefined;
      if (pixylLesionLoading) {
        if (pixylAnalysisRunning) {
          const longitudinalInformation =
            isLongitudinal === true
              ? ' longitudinal'
              : isLongitudinal === false
              ? ' cross sectional'
              : '';
          loadingMessage = `Pixyl${longitudinalInformation} analysis is running...`;
        } else if (pixylWaitingUploadSegmentation) {
          loadingMessage = 'Loading segmentation...';
        } else {
          loadingMessage = 'Loading...';
        }
        isLoading = true;
      }
      const Loading = (
        <div
          style={{
            color: 'var(--default-color)',
            fontSize: '30px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {patientIdentification && (
            <div>{`Patient ${patientIdentification}`}</div>
          )}
          {visitDate && (
            <div>
              {`Visit date ` + moment(visitDate).format('YYYY-MM-DD')}{' '}
              {visitDateRefAnalysis
                ? `VS ${moment(visitDateRefAnalysis).format('YYYY-MM-DD')}`
                : ''}
            </div>
          )}
          <div>{loadingMessage}</div>
        </div>
      );
      return isLoading ? Loading : BaseViewport;
    } else {
      return BaseViewport;
    }
  }
}
