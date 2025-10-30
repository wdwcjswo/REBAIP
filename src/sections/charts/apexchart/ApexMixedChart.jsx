'use client';


import { useState, forwardRef, useRef, useImperativeHandle, useMemo } from 'react';

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
    width: [2, 2, 2] 
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

const ApexMixedChart = forwardRef(function ApexMixedChart({ chartData, chartColors = [], colorMapping = {}, chartTypeMapping = {}, policyAnnotations = [], ctype = [] }, ref) {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.grey[200];
  const secondary = theme.palette.primary[700];

  // 동적 차트 id (여러 인스턴스 대비)
  const [chartId] = useState('chart-' + Math.random().toString(36).substring(2, 9));

  // yaxis min/max 값 상수로 관리
  const YAXIS_PERCENT_MIN = 0;
  const YAXIS_PERCENT_MAX = 3;
  const YAXIS_INDEX_MIN = 90;
  const YAXIS_INDEX_MAX = 120;

  // chartData에서 series, categories를 직접 계산 (useMemo)
  const series = useMemo(() => {
    if (chartData && chartData.data && chartData.data.datasets && Array.isArray(chartData.data.datasets)) {
      const filteredCtypes = Array.isArray(ctype) ? ctype.filter(Boolean).slice(0, chartData.data.datasets.length) : [];
      const allSame = filteredCtypes.length > 0 && filteredCtypes.every(ct => ct === filteredCtypes[0]);
      const uniqueCtypes = allSame ? [filteredCtypes[0]] : [...new Set(filteredCtypes)];
      return chartData.data.datasets.map((dataset, index) => {
        let chartType;
        if (dataset.statblid && chartTypeMapping && chartTypeMapping[dataset.statblid]) {
          chartType = chartTypeMapping[dataset.statblid];
        } else {
          chartType = 'line';
        }
        // 모두 같으면 yAxisIndex는 0, 아니면 uniqueCtypes 인덱스
        let yAxisIndex = 0;
        if (!allSame && Array.isArray(ctype) && ctype[index]) {
          yAxisIndex = uniqueCtypes.indexOf(ctype[index]);
        }
        return {
          name: dataset.label || dataset.name || `데이터 ${index + 1}`,
          label: dataset.label || dataset.name || `데이터 ${index + 1}`,
          type: chartType,
          data: Array.isArray(dataset.data) ? dataset.data : [],
          yAxisIndex,
          statblid: dataset.statblid
        };
      });
    }
    return [];
  }, [chartData, chartTypeMapping, ctype]);

  const categories = useMemo(() => {
    if (chartData && chartData.labels && Array.isArray(chartData.labels) && chartData.labels.length > 0) {
      return chartData.labels;
    } else if (series.length > 0 && Array.isArray(series[0].data) && series[0].data.length > 0 && series[0].data[0].x !== undefined) {
      return series[0].data.map(item => item.x);
    }
    return [];
  }, [chartData, series]);


  // options를 useMemo로 계산하여 바로 Chart에 넘김
  const options = useMemo(() => {
    // 시리즈별 색상은 항상 series 순서대로 강제 지정 (yAxisIndex와 무관)
    const dynamicColors = series.map((seriesItem, idx) => {
      let color = colorMapping?.[seriesItem.statblid];
      if (!color) color = chartColors[idx];
      if (!color) color = chartColors[0];
      if (!color) color = '#1976d2';
      return color;
    });

    let yaxis = null;
    if (ctype && ctype.length > 0 && series.length > 0) {
      // 항상 series.length에 맞춰 yaxis, ctype, colors 동기화
      const filtered = ctype.filter(Boolean).slice(0, series.length);
      // 실제 남은 시리즈의 ctype이 모두 같으면 1개, 다르면 각각 yaxis 생성
      const allSame = filtered.length > 0 && filtered.every(ct => ct === filtered[0]);
      const yaxisColors = dynamicColors.slice(0, series.length);
      if (filtered.length === 1 || allSame) {
        // 1개만 남았거나 모두 같으면 yaxis 1개만 생성
        const axisColor = yaxisColors[0] || '#1976d2';
        yaxis = [
          {
            seriesName: filtered[0] || 'Y',
            axisTicks: { show: true },
            axisBorder: { show: true, color: axisColor },
            labels: {
              style: { colors: axisColor },
              formatter: val => Math.floor(val)
            },
            title: {
              text: filtered[0] || 'Y',
              style: { color: axisColor }
            },
            opposite: false,
            tooltip: { enabled: true }
          }
        ];
      } else {
        // 남은 시리즈의 ctype이 다르면 각각 yaxis 생성 (항상 series.length만큼)
        yaxis = Array.from({ length: series.length }).map((_, idx) => {
          const ct = filtered[idx];
          const axisColor = yaxisColors[idx % yaxisColors.length];
          const isIndexRight = ct === 'dt-index';
          const isPercentRight = ct === 'dt-percent' && idx > 0;
          const base = {
            seriesName: ct,
            axisTicks: { show: true },
            axisBorder: { show: true, color: axisColor },
            labels: {
              style: { colors: axisColor },
              formatter: val => Math.floor(val)
            },
            title: {
              text: ct,
              style: { color: axisColor }
            },
            opposite: idx > 0,
            tooltip: { enabled: true }
          };
          return {
            ...base,
            ...(isPercentRight ? { min: YAXIS_PERCENT_MIN, max: YAXIS_PERCENT_MAX } : {}),
            ...(isIndexRight ? { min: YAXIS_INDEX_MIN, max: YAXIS_INDEX_MAX } : {})
          };
        });
      }
    }

    let annotations = { xaxis: [], points: [] };
    if (Array.isArray(policyAnnotations) && policyAnnotations.length > 0 && categories && categories.length > 0) {
      function normalizeDate(date) {
        if (!date) return '';
        if (date.length === 8) return date.slice(0,6);
        return date;
      }
      annotations.xaxis = policyAnnotations.map((policy, idx) => {
        const normDate = normalizeDate(policy.date);
        const catIdx = categories.findIndex(cat => {
          const catStr = String(cat).replace(/[^0-9]/g, '').slice(0,6);
          return catStr === normDate;
        });
        if (catIdx === -1) return null;
        return {
          x: categories[catIdx],
          borderColor: '#0e0d0dff',
          strokeDashArray: 6,
          opacity: 1,
          width: 2,
          label: { show: false }
        };
      }).filter(Boolean);
      annotations.points = policyAnnotations.map((policy, idx) => {
        const normDate = normalizeDate(policy.date);
        const catIdx = categories.findIndex(cat => {
          const catStr = String(cat).replace(/[^0-9]/g, '').slice(0,6);
          return catStr === normDate;
        });
        if (catIdx === -1) return null;
        let yVal = null;
        if (series && series.length > 0 && Array.isArray(series[0].data)) {
          const d = series[0].data[catIdx];
          yVal = (typeof d === 'object' && d !== null && 'y' in d) ? d.y : d;
        }
        if (yVal === null || isNaN(yVal)) return null;
        return {
          x: categories[catIdx],
          y: yVal,
          marker: {
            size: 0,
            fillColor: '#888',
            strokeColor: '#888',
            shape: 'rect',
            radius: 2
          },
          label: {
            borderColor: '#888',
            style: {
              color: '#fff',
              background: 'rgba(0,0,0,0.5)',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: 10,
              padding: { left: 18, right: 18, top: 8, bottom: 8 },
              letterSpacing: '0.04em',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.5)'
            },
            orientation: 'horizontal',
            text: policy.title,
            position: 'top',
            offsetY: -12,
            offsetX: 0
          }
        };
      }).filter(Boolean);
    }

    return {
      ...mixedChartOptions,
      colors: dynamicColors,
      fill: {
        colors: dynamicColors
      },
      stroke: {
        colors: dynamicColors,
        width: Array(series.length).fill(2)
      },
      markers: {
        colors: dynamicColors
      },
      xaxis: {
        type: 'category',
        categories: categories,
        tickAmount: 20,
        min: 0,
        max: categories.length > 0 ? categories.length - 1 : undefined,
        labels: {
          show: true,
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis,
      grid: {
        borderColor: line
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        position: 'bottom',
        fontFamily: `'Roboto', sans-serif`,
        offsetX: 10,
        offsetY: 10,
        floating: false,
        labels: {
          colors: 'grey.500',
          useSeriesColors: false,
          maxWidth: 9999 // 한 줄로 길게
        },
        markers: {
          width: 16,
          height: 16,
          radius: 5
        },
        itemMargin: {
          horizontal: 8,
          vertical: 0
        },
        onItemClick: { toggleDataSeries: true },
        onItemHover: { highlightDataSeries: true },
        style: { whiteSpace: 'nowrap', flexWrap: 'nowrap' }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      },
      annotations
    };
  }, [mode, primary, line, grey200, secondary, chartColors, colorMapping, chartTypeMapping, policyAnnotations, ctype, series, categories, mixedChartOptions]);


  // exportToImage 메서드를 ref로 노출 (ApexCharts exec 사용)
  useImperativeHandle(ref, () => ({
    async exportToImage(retry = 0) {
      //console.log(`[exportToImage] called, retry: ${retry}, window.ApexCharts:`, typeof window !== 'undefined' ? window.ApexCharts : undefined);
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

  // 강제 리렌더링을 위해 key에 annotation hash 추가 (options.annotations가 아닌 policyAnnotations 등에서 파생)
  const annotationKey = JSON.stringify(policyAnnotations || []);
  return (
    <Box id="chart" sx={{ bgcolor: 'transparent' }}>
      {series && Array.isArray(series) && series.length > 0 && categories && Array.isArray(categories) ? (
        <ReactApexChart
          key={chartId + annotationKey}
          options={{ ...options, chart: { ...options.chart, id: chartId }, annotations: options.annotations }}
          series={series}
          type="line"
          height={400}
        />
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