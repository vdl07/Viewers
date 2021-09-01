import './LoadingPanel.css';

import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';

class LoadingPanel extends PureComponent {
  static propTypes = {
    error: PropTypes.object,
    t: PropTypes.func,
  };

  static defaultProps = {
    error: null,
  };

  render() {
    return (
      <React.Fragment>
        <div className="loaderApp">
          <BeatLoader></BeatLoader>
        </div>
      </React.Fragment>
    );
  }
}

const connectedComponent = withTranslation('Common')(LoadingPanel);
export { connectedComponent as LoadingPanel };
