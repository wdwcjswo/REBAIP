
'use client';

import { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';

// ApexCharts exec를 위해 window에 강제로 attach
import ApexCharts from 'apexcharts';
if (typeof window !== 'undefined' && !window.ApexCharts) {
  window.ApexCharts = ApexCharts;
}

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

const ApexMixedChart = forwardRef(function ApexMixedChart({ chartData, chartColors = [], colorMapping = {}, chartTypeMapping = {} }, ref) {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.grey[200];
  const secondary = theme.palette.primary[700];

  // 동적 차트 id (여러 인스턴스 대비)
  const [chartId] = useState('chart-' + Math.random().toString(36).substring(2, 9));

  // chartData를 기반으로 series와 categories 생성
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

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
      
      // labels가 있으면 categories 업데이트, 없으면 series[0].data의 x값을 사용
      if (chartData.labels && Array.isArray(chartData.labels) && chartData.labels.length > 0) {
        setCategories(chartData.labels);
      } else if (newSeries.length > 0 && Array.isArray(newSeries[0].data) && newSeries[0].data.length > 0 && newSeries[0].data[0].x !== undefined) {
        setCategories(newSeries[0].data.map(item => item.x));
      } else {
        setCategories([]);
      }
    }
  }, [chartData, colorMapping, chartTypeMapping]);

  const [options, setOptions] = useState({ 
    ...mixedChartOptions, 
    yaxis: [...mixedChartOptions.yaxis, { logarithmic: true }] 
  });


  useEffect(() => {
    // statblid 기반으로 동적 색상 배열 생성
    const dynamicColors = series.map((seriesItem, idx) => {
      let color = colorMapping?.[seriesItem.statblid];
      if (!color) color = chartColors[idx];
      if (!color) color = chartColors[0];
      if (!color) color = '#1976d2';
      return color;
    });

    //console.log('ApexMixedChart Dynamic colors', dynamicColors);
    console.log('ApexMixedChart series:', series);
    console.log('ApexMixedChart categories:', categories);
    console.log('ApexMixedChart chartData:', chartData);

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
  }, [mode, primary, line, grey200, secondary, categories, series, chartColors, colorMapping, chartTypeMapping]); 


  // exportToImage 메서드를 ref로 노출 (ApexCharts exec 사용)
  useImperativeHandle(ref, () => ({
    async exportToImage(retry = 0) {
      console.log(`[exportToImage] called, retry: ${retry}, window.ApexCharts:`, typeof window !== 'undefined' ? window.ApexCharts : undefined);
      if (
        typeof window !== 'undefined' &&
        window.ApexCharts &&
        chartId &&
        series.length > 0 &&
        categories.length > 0
      ) {
        try {
          const dataURI = await window.ApexCharts.exec(chartId, 'dataURI');
          if (dataURI?.imgURI) {
            console.log(`[exportToImage] SUCCESS at retry ${retry}`);
            return dataURI.imgURI;
          }
          // 재시도 (최대 10회)
          if (retry < 10) {
            console.log(`[exportToImage] imgURI undefined, retrying... (${retry + 1})`);
            await new Promise(res => setTimeout(res, 200));
            return await ref.current.exportToImage(retry + 1);
          }
        } catch (e) {
          console.error('ApexCharts exportToImage error:', e);
          return null;
        }
      } else {
        if (retry < 10) {
          console.log(`[exportToImage] window.ApexCharts not ready, retrying... (${retry + 1})`);
          await new Promise(res => setTimeout(res, 200));
          return await ref.current.exportToImage(retry + 1);
        }
      }
      console.log('[exportToImage] FAILED after max retries');
      return null;
    }
  }), [chartId, series, categories]);

  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      {series && Array.isArray(series) && series.length > 0 && categories && Array.isArray(categories) ? (
        <ReactApexChart options={{ ...options, chart: { ...options.chart, id: chartId } }} series={series} type="line" height={400} />
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
});

export default ApexMixedChart;