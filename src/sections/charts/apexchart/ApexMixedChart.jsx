'use client';

import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'config';

// chart options
const mixedChartOptions = {
  chart: {
    type: 'line',
    stacked: false,
    height: 450,
    background: 'transparent'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [1, 1, 4]
  },
  xaxis: {
    categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]
  },
  legend: {
    show: true,
    fontFamily: `'Roboto', sans-serif`,
    position: 'bottom',
    offsetX: 10,
    offsetY: 10,
    labels: {
      useSeriesColors: false
    },
    markers: {
      width: 16,
      height: 16,
      radius: 5
    },
    itemMargin: {
      horizontal: 15,
      vertical: 8
    }
  },
  yaxis: [
    {
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
        color: '#008FFB'
      },
      labels: {
        style: {
          colors: '#008FFB'
        }
      },
      title: {
        text: 'Income (thousand crores)',
        style: {
          color: '#008FFB'
        }
      },
      tooltip: {
        enabled: true
      }
    },
    {
      seriesName: 'Income',
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
        color: '#00E396'
      },
      labels: {
        style: {
          colors: '#00E396'
        }
      },
      title: {
        text: 'Operating Cashflow (thousand crores)',
        style: {
          color: '#00E396'
        }
      }
    },
    {
      seriesName: 'Revenue',
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
        color: '#FEB019'
      },
      labels: {
        style: {
          colors: '#FEB019'
        }
      },
      title: {
        text: 'Revenue (thousand crores)',
        style: {
          color: '#FEB019'
        }
      }
    }
  ]
};

// ==============================|| APEXCHART - MIXED ||============================== //

export default function ApexMixedChart({ chartData }) {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.grey[200];

  const secondary = theme.palette.primary[700];
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.main;

  // chartData를 기반으로 series와 categories 생성
  const [series, setSeries] = useState([
    {
      name: 'Income',
      type: 'column',
      data: [14, 2, 25, 15, 25, 28, 38, 46]
    },
    {
      name: 'Cashflow',
      type: 'column',
      data: [11, 3, 31, 4, 41, 49, 65, 85]
    },
    {
      name: 'Revenue',
      type: 'line',
      data: [20, 29, 37, 36, 44, 45, 55, 86]
    }
  ]);

  const [categories, setCategories] = useState([2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]);

  // chartData가 변경될 때마다 series와 categories 업데이트
  useEffect(() => {
    if (chartData && chartData.data && chartData.data.datasets) {
      console.log('ApexMixedChart: Updating chart with new data', chartData);
      
      // datasets를 ApexCharts series 형식으로 변환
      const newSeries = chartData.data.datasets.map((dataset, index) => ({
        name: dataset.name || dataset.label || `데이터 ${index + 1}`,
        type: index === chartData.data.datasets.length - 1 ? 'line' : 'column', // 마지막 series는 line으로
        data: dataset.data || []
      }));
      
      setSeries(newSeries);
      
      // labels가 있으면 categories 업데이트
      if (chartData.labels && chartData.labels.length > 0) {
        setCategories(chartData.labels);
      }
    }
  }, [chartData]);

  const [options, setOptions] = useState({ 
    ...mixedChartOptions, 
    yaxis: [...mixedChartOptions.yaxis, { logarithmic: true }] 
  });

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [secondary, primaryMain, successDark],
      xaxis: {
        categories: categories, // 동적으로 업데이트된 categories 사용
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      legend: {
        labels: {
          colors: 'grey.500'
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, line, grey200, secondary, primaryMain, successDark, categories]); // categories 의존성 추가

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      <ReactApexChart options={options} series={series} type="line" />
    </Box>
  );
}
