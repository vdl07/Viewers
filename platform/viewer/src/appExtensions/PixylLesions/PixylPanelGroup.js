import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class PixylPanelGroup extends React.Component {
  static propTypes = {
    msLesionsBySerie: PropTypes.object,
    onClickPanelGroupItem: PropTypes.func,
    viewports: PropTypes.object,
    selectedSerieUUID: PropTypes.string,
    onClickPanelGroupItemReport: PropTypes.func,
    isReportMode: PropTypes.bool,
  };

  render() {
    const { msLesionsBySerie, onClickPanelGroupItem } = this.props;
    const serieUUIDList = msLesionsBySerie && Object.keys(msLesionsBySerie);
    if (!serieUUIDList || serieUUIDList.length === 0) {
      return null;
    }
    const panelGroupItem = serieUUIDList
      .sort((a, b) => {
        const serieA = this._getViewportDataBySerieUUID(a);
        const serieB = this._getViewportDataBySerieUUID(b);
        return serieA && serieB && serieA.SeriesNumber > serieB.SeriesNumber
          ? 1
          : -1;
      })
      .map((serieUUID, index) => {
        return (
          <div
            key={index}
            style={{ width: `${100 / (serieUUIDList.length + 1)}%` }}
            className={`roundedButtonWrapper noselect ${
              !this.props.isReportMode &&
              serieUUID === this.props.selectedSerieUUID
                ? 'active'
                : ''
            }`}
          >
            <div
              className="roundedButton pixyl"
              onClick={() => onClickPanelGroupItem(serieUUID, index)}
            >
              <title>{`${serieUUID} ${moment(
                msLesionsBySerie[serieUUID].seriesDate
              ).format('YYYYMMDD')}`}</title>
              {`V${index}`}
            </div>
          </div>
        );
      });
    return (
      <div className="RoundedButtonGroup pixyl clearfix center-table">
        {panelGroupItem}
        <div
          style={{ width: `${100 / (serieUUIDList.length + 1)}%` }}
          className={`roundedButtonWrapper noselect ${
            this.props.isReportMode ? 'active' : ''
          }`}
        >
          <div
            className="roundedButton pixyl"
            onClick={() => this.props.onClickPanelGroupItemReport()}
          >
            {`rapport`}
          </div>
        </div>
      </div>
    );
  }

  _getViewportDataBySerieUUID(serieUUID) {
    const { viewports } = this.props;
    const index =
      viewports &&
      viewports.viewportSpecificData &&
      Object.keys(viewports.viewportSpecificData).find(
        f => viewports.viewportSpecificData[f].SeriesInstanceUID == serieUUID
      );
    if (index !== undefined) {
      return viewports.viewportSpecificData[index];
    }
  }
}
