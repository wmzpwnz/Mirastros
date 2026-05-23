'use client';

/**
 * Chart Component
 * A data visualization component supporting bar, line, pie, and area charts
 */

import React, { useMemo } from 'react';
import type { ChartProps } from '../types';

export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      type,
      data,
      title,
      xAxisLabel,
      yAxisLabel,
      showLegend = true,
      showTooltips = true,
      height = 300,
      width = '100%',
      animated = true,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    // Calculate chart dimensions
    const chartWidth = typeof width === 'number' ? width : 400;
    const chartHeight = height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Calculate scales
    const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
    const yScale = innerHeight / maxValue;
    const xScale = innerWidth / (data.length - 1 || 1);

    // Render bar chart
    const renderBarChart = () => {
      const barWidth = innerWidth / data.length * 0.8;
      const barGap = innerWidth / data.length * 0.2;

      return (
        <g>
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#4B5563"
            strokeWidth="2"
          />
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* Bars */}
          {data.map((point, idx) => {
            const x = padding.left + idx * (barWidth + barGap) + barGap / 2;
            const barHeight = point.value * yScale;
            const y = chartHeight - padding.bottom - barHeight;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={point.color || '#FFC107'}
                  className={animated ? 'transition-all duration-300' : ''}
                  opacity="0.8"
                />
                {/* Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-400"
                >
                  {point.label}
                </text>
                {/* Value */}
                {showTooltips && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-200 font-semibold"
                  >
                    {point.value}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      );
    };

    // Render line chart
    const renderLineChart = () => {
      const points = data.map((point, idx) => {
        const x = padding.left + idx * xScale;
        const y = chartHeight - padding.bottom - point.value * yScale;
        return { x, y, ...point };
      });

      const pathData = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

      return (
        <g>
          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#4B5563"
            strokeWidth="2"
          />
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#FFC107"
            strokeWidth="2"
            className={animated ? 'transition-all duration-300' : ''}
          />

          {/* Points */}
          {points.map((point, idx) => (
            <g key={idx}>
              <circle cx={point.x} cy={point.y} r="4" fill={point.color || '#FFC107'} />
              {/* Label */}
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {point.label}
              </text>
              {/* Value */}
              {showTooltips && (
                <text
                  x={point.x}
                  y={point.y - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-200 font-semibold"
                >
                  {point.value}
                </text>
              )}
            </g>
          ))}
        </g>
      );
    };

    // Render pie chart
    const renderPieChart = () => {
      const total = data.reduce((sum, d) => sum + d.value, 0);
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const centerX = padding.left + innerWidth / 2;
      const centerY = padding.top + innerHeight / 2;

      let currentAngle = -Math.PI / 2;
      const slices = data.map((point, idx) => {
        const sliceAngle = (point.value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        currentAngle = endAngle;

        return { pathData, labelX, labelY, ...point };
      });

      return (
        <g>
          {slices.map((slice, idx) => (
            <g key={idx}>
              <path
                d={slice.pathData}
                fill={slice.color || '#FFC107'}
                opacity="0.8"
                className={animated ? 'transition-all duration-300' : ''}
              />
              {showTooltips && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  className="text-xs fill-cosmic font-semibold"
                >
                  {Math.round((slice.value / total) * 100)}%
                </text>
              )}
            </g>
          ))}
        </g>
      );
    };

    const baseStyles = 'w-full';
    const containerClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <div
        ref={ref}
        className={containerClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || `${type} chart`}
        aria-describedby={ariaDescribedBy}
      >
        {title && <h3 className="mb-4 text-lg font-semibold text-gray-200">{title}</h3>}

        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="bg-gray-900 rounded"
          role="img"
        >
          {/* Y-axis label */}
          {yAxisLabel && (
            <text
              x={15}
              y={chartHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 15 ${chartHeight / 2})`}
              className="text-xs fill-gray-400"
            >
              {yAxisLabel}
            </text>
          )}

          {/* X-axis label */}
          {xAxisLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {xAxisLabel}
            </text>
          )}

          {/* Chart content */}
          {type === 'bar' && renderBarChart()}
          {type === 'line' && renderLineChart()}
          {type === 'pie' && renderPieChart()}
          {type === 'area' && renderLineChart()}
        </svg>

        {/* Legend */}
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4">
            {data.map((point) => (
              <div key={point.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: point.color || '#FFC107' }}
                />
                <span className="text-sm text-gray-400">{point.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

Chart.displayName = 'Chart';
