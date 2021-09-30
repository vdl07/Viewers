import React from 'react';
import PropTypes from 'prop-types';

export class PixylCornerstoneViewport extends React.Component {
  static propTypes = {
    BaseViewport: PropTypes.object,
    pixylLesions: PropTypes.object,
  };

  render() {
    const props = this.props;
    const { BaseViewport, pixylLesions: pixylLesionsExtract } = props;
    if (pixylLesionsExtract) {
      const {
        pixylLesionLoading,
        pixylWaitingUploadSegmentation,
        pixylLesionError,
        pixylAnalysisRunning,
      } = pixylLesionsExtract;
      if (pixylLesionError) {
        return BaseViewport;
        //return <div>{"Error loading Pixyl's lesions"}</div>;
      }
      let isLoading = false;
      let loadingMessage = undefined;
      if (pixylLesionLoading) {
        if (pixylAnalysisRunning) {
          loadingMessage = 'Pixyl analysis is running...';
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
          {loadingMessage}
        </div>
      );
      return isLoading ? Loading : BaseViewport;
    } else {
      return BaseViewport;
    }
  }
}
