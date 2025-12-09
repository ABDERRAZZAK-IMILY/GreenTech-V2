import React from 'react';

const KPICard = ({
  icon,
  iconGradient,
  title,
  value,
  unit,
  trend,
  trendValue,
  isLarge = false,
  extraInfo,
  valueColor
}) => {
  return (
    <div className={`kpi-card ${isLarge ? 'kpi-card-tall' : ''}`}>
      <div
        className="kpi-icon"
        style={{ background: iconGradient }}
      >
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value" style={valueColor ? { color: valueColor } : {}}>
          {value} <span>{unit}</span>
        </div>
        <div className={`kpi-trend ${trend}`}>
          <i className={`fas fa-${trend === 'positive' ? 'arrow-down' : trend === 'negative' ? 'arrow-up' : 'minus'}`}></i> {trendValue}
        </div>
        {extraInfo && (
          <div className="kpi-extra-info">
            {extraInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
