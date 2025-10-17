'use client';

import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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
    height: 400,
    background: 'transparent'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [2, 2, 3] // column: 2, area: 2, line: 3
  },
  xaxis: {
    categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]
  },
  legend: {
    show: true,
    showForSingleSeries: true, // 단일 시리즈일 때도 범례 표시
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
        color: '#1976d2'
      },
      labels: {
        style: {
          colors: '#1976d2'
        }
      },
      title: {
        text: 'OPT1',
        style: {
          color: '#1976d2'
        }
      },
      tooltip: {
        enabled: true
      }
    },
    {
      seriesName: 'OPT2',
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
        color: '#2e7d32'
      },
      labels: {
        style: {
          colors: '#2e7d32'
        }
      },
      title: {
        text: 'OPT2',
        style: {
          color: '#2e7d32'
        }
      }
    },
    {
      seriesName: 'OPT3',
      opposite: true,
      axisTicks: {
        show: true
      },
      axisBorder: {
        show: true,
        color: '#d32f2f'
      },
      labels: {
        style: {
          colors: '#d32f2f'
        }
      },
      title: {
        text: 'OPT3',
        style: {
          color: '#d32f2f'
        }
      }
    }
  ]
};

// ==============================|| APEXCHART - MIXED ||============================== //

export default function ApexMixedChart({ chartData, chartColors, colorMapping, chartTypeMapping }) {
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
      name: 'OPT1', // 범례에 표시될 이름
      label: 'OPT1', // y축 title용
      type: 'line',
      data: [14, 2, 25, 15, 25, 28, 38, 46]
    },
    {
      name: 'OPT2', // 범례에 표시될 이름
      label: 'OPT2', // y축 title용
      type: 'line',
      data: [11, 3, 31, 4, 41, 49, 65, 85]
    },
    {
      name: 'OPT3', // 범례에 표시될 이름
      label: 'OPT3', // y축 title용
      type: 'line',
      data: [20, 29, 37, 36, 44, 45, 55, 86]
    }
  ]);

  const [categories, setCategories] = useState([2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]);

  // chartData가 변경될 때마다 series와 categories 업데이트
  useEffect(() => {
    if (chartData && chartData.data && chartData.data.datasets && Array.isArray(chartData.data.datasets)) {
      //console.log('ApexMixedChart: Updating chart with new data', chartData);
      //console.log('ApexMixedChart: Color mapping', colorMapping);
      
      // datasets를 ApexCharts series 형식으로 변환
      const newSeries = chartData.data.datasets.map((dataset, index) => {
        // statblid 기반으로 차트 타입 결정 (chartTypeMapping이 있으면 우선 사용)
        let chartType;
        if (dataset.statblid && chartTypeMapping && chartTypeMapping[dataset.statblid]) {
          chartType = chartTypeMapping[dataset.statblid];
        } else {
          // fallback: 인덱스 기반 차트 타입
          switch (index % 3) {
            case 0: chartType = 'column'; break;
            case 1: chartType = 'area'; break;
            case 2: chartType = 'line'; break;
            default: chartType = 'column';
          }
        }
        
        return {
          name: dataset.label || dataset.name || `데이터 ${index + 1}`, // 범례에 표시될 이름
          label: dataset.label || dataset.name || `데이터 ${index + 1}`, // y축 title용
          type: chartType, // statblid 기반 동적 차트 타입
          data: Array.isArray(dataset.data) ? dataset.data : [],
          yAxisIndex: index % 3, // 0, 1, 2 순환하여 각 y축에 할당
          statblid: dataset.statblid // statblid 정보 보존
        };
      });
      
      setSeries(newSeries);
      
      // labels가 있으면 categories 업데이트
      if (chartData.labels && Array.isArray(chartData.labels) && chartData.labels.length > 0) {
        setCategories(chartData.labels);
      }
    }
  }, [chartData, colorMapping, chartTypeMapping]);

  const [options, setOptions] = useState({ 
    ...mixedChartOptions, 
    yaxis: [...mixedChartOptions.yaxis, { logarithmic: true }] 
  });

  useEffect(() => {
    // statblid 기반으로 동적 색상 배열 생성
    const dynamicColors = series.map(seriesItem => {
      if (seriesItem.statblid && colorMapping && colorMapping[seriesItem.statblid]) {
        return colorMapping[seriesItem.statblid];
      }
      // fallback: 기본 색상 배열 사용
      const fallbackIndex = series.findIndex(s => s === seriesItem);
      return chartColors[fallbackIndex] || chartColors[0] || '#1976d2';
    });

    //console.log('ApexMixedChart: Dynamic colors', dynamicColors);
    //console.log('ApexMixedChart: Series', series);

    setOptions((prevState) => ({
      ...prevState,
      colors: dynamicColors, // statblid 기반 동적 색상 사용
      fill: {
        colors: dynamicColors // fill 색상도 명시적으로 설정
      },
      stroke: {
        colors: dynamicColors, // stroke 색상도 명시적으로 설정
        width: [2, 2, 3] // column: 2, area: 2, line: 3
      },
      xaxis: {
        categories: categories, // 동적으로 업데이트된 categories 사용
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis: [
        {
          seriesName: series[0]?.label || series[0]?.name || 'OPT1',
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: dynamicColors[0] || chartColors[0] // 동적 색상 사용
          },
          labels: {
            style: {
              colors: dynamicColors[0] || chartColors[0] // 동적 색상 사용
            },
            formatter: function (val) {
              return Math.floor(val); // 소수점 제거
            }
          },
          title: {
            text: series[0]?.label || 'OPT1',
            style: {
              color: dynamicColors[0] || chartColors[0] // 동적 색상 사용
            }
          },
          tooltip: {
            enabled: true
          }
        },
        {
          seriesName: series[1]?.label || series[1]?.name || 'OPT2',
          opposite: true,
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: dynamicColors[1] || chartColors[1] // 동적 색상 사용
          },
          labels: {
            style: {
              colors: dynamicColors[1] || chartColors[1] // 동적 색상 사용
            },
            formatter: function (val) {
              return Math.floor(val); // 소수점 제거
            }
          },
          title: {
            text: series[1]?.label || 'OPT2',
            style: {
              color: dynamicColors[1] || chartColors[1] // 동적 색상 사용
            }
          }
        },
        {
          seriesName: series[2]?.label || series[2]?.name || 'OPT3',
          opposite: true,
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true,
            color: dynamicColors[2] || chartColors[2] // 동적 색상 사용
          },
          labels: {
            style: {
              colors: dynamicColors[2] || chartColors[2] // 동적 색상 사용
            },
            formatter: function (val) {
              return Math.floor(val); // 소수점 제거
            }
          },
          title: {
            text: series[2]?.label || 'OPT3',
            style: {
              color: dynamicColors[2] || chartColors[2] // 동적 색상 사용
            }
          }
        }
      ],
      grid: {
        borderColor: line
      },
      legend: {
        show: true,
        showForSingleSeries: true, // 단일 시리즈일 때도 범례 표시
        position: 'bottom',
        fontFamily: `'Roboto', sans-serif`,
        offsetX: 10,
        offsetY: 10,
        labels: {
          colors: 'grey.500',
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
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, line, grey200, secondary, primaryMain, successDark, categories, series, chartColors, colorMapping, chartTypeMapping]); 

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      {series && Array.isArray(series) && series.length > 0 && categories && Array.isArray(categories) ? (
        <ReactApexChart options={options} series={series} type="line" height={400} />
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          color: 'text.secondary'
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
