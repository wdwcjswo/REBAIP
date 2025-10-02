import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

export default function ApexReportChart({ chartData }) {
  const theme = useTheme();

  // 기본값 처리
  const defaultSeries = [{ name: '데이터 없음', data: [0] }];
  const defaultOptions = {
    chart: { type: 'line', height: 340, toolbar: { show: false } },
    xaxis: { categories: [''], labels: { style: { colors: theme.palette.text.secondary } } },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [theme.palette.warning.main],
    legend: { show: false },
    grid: { row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } }
  };

  // chartData 변환
  let series = defaultSeries;
  let options = defaultOptions;
  if (chartData && chartData.data && chartData.data.datasets) {
    series = chartData.data.datasets.map(ds => ({
      name: ds.label || '데이터',
      data: ds.data.map(point => (typeof point === 'object' ? point.y : point))
    }));
    options = {
      ...defaultOptions,
      xaxis: {
        ...defaultOptions.xaxis,
        categories: chartData.labels || ['']
      }
    };
  }

  return (
    <Chart options={options} series={series} type="line" height={340} />
  );
}
