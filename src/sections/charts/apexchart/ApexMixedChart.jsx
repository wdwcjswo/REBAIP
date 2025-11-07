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

  // chartData에서 series, categories를 직접 계산 (useMemo)
  const series = useMemo(() => {
    if (chartData && chartData.data && chartData.data.datasets && Array.isArray(chartData.data.datasets)) {
      return chartData.data.datasets.map((dataset, index) => {
        let chartType;
        if (dataset.statblid && chartTypeMapping && chartTypeMapping[dataset.statblid]) {
          chartType = chartTypeMapping[dataset.statblid];
        } 
        
        // ctype 배열과 datasets 배열의 인덱스가 일치하도록 함
        let currentCtype = 'dt-index'; // 기본값
        if (Array.isArray(ctype) && ctype[index]) {
          currentCtype = ctype[index];
        }
        
        return {
          name: dataset.label || dataset.name || `데이터 ${index + 1}`,
          label: dataset.label || dataset.name || `데이터 ${index + 1}`,
          type: chartType,
          data: Array.isArray(dataset.data) ? dataset.data : [],
          yAxisIndex: index,
          ctype: currentCtype,
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
     
 // Y축 설정 - 지수 관련은 같은 축 공유, 가격은 별도 축
    let yaxis = null;
    if (series.length > 0) {
      const yaxisColors = dynamicColors.slice(0, series.length);
      
      // isIndex인 시리즈들의 전체 데이터 범위 계산
      let indexMin = Infinity;
      let indexMax = -Infinity;
      series.forEach(s => {
        if (s.ctype === 'dt-index' && Array.isArray(s.data)) {
          s.data.forEach(val => {
            const numVal = (typeof val === 'object' && val !== null && 'y' in val) ? val.y : val;
            if (numVal !== null && numVal !== undefined && !isNaN(numVal)) {
              indexMin = Math.min(indexMin, numVal);
              indexMax = Math.max(indexMax, numVal);
            }
          });
        }
      });
      
      // 유효한 범위가 없으면 undefined로 설정
      if (indexMin === Infinity || indexMax === -Infinity) {
        indexMin = undefined;
        indexMax = undefined;
      } else {
        // 약간의 여백 추가 (5%)
        const range = indexMax - indexMin;
        indexMin = indexMin - range * 0.05;
        indexMax = indexMax + range * 0.05;
        
        // 10단위로 반올림
        indexMin = Math.floor(indexMin / 10) * 10;
        indexMax = Math.ceil(indexMax / 10) * 10;
      }
      
      // 시리즈별로 yaxis 생성하되, 지수 관련은 첫 번째 Y축 공유
      yaxis = series.map((s, idx) => {
        const isIndex = (s.ctype === 'dt-index' );
        const isPercent = (s.ctype === 'dt-percent');
        
        if (isIndex) {
          // 지수 관련 시리즈는 각자의 이름 사용하되, Y축은 공유
          const firstIndexIdx = series.findIndex(ser => ser.ctype === 'dt-index');
          return {
            seriesName: s.name, // 각 시리즈의 고유한 이름 사용
            axisTicks: { show: idx === firstIndexIdx },
            axisBorder: { show: idx === firstIndexIdx, color: yaxisColors[firstIndexIdx] },
            labels: {
              show: idx === firstIndexIdx,
              style: { colors: yaxisColors[firstIndexIdx] },
              formatter: val => {
                if (val === 0) return '0';
                return Math.floor(val).toLocaleString();
              }
            },
            title: {
              text: idx === firstIndexIdx ? '지수' : undefined,
              style: { color: yaxisColors[firstIndexIdx] }
            },
            opposite: false,
            // 모든 isIndex 시리즈에 동일한 min/max 적용하여 스케일 동기화
            min: indexMin,
            max: indexMax
          };
        } else if (isPercent) {
          // 변동률은 별도 Y축
          return {
            seriesName: s.name,
            axisTicks: { show: true },
            axisBorder: { show: true, color: yaxisColors[idx] },
            labels: {
              style: { colors: yaxisColors[idx] },
              formatter: val => {
                if (val === 0) return '0';
                return Math.floor(val).toLocaleString();
              }
            },
            title: {
              text: '변동률',
              style: { color: yaxisColors[idx] }
            },
            opposite: true
          };
        } else {
          // 기타
          return {
            seriesName: s.name,
            axisTicks: { show: true },
            axisBorder: { show: true, color: yaxisColors[idx] },
            labels: {
              style: { colors: yaxisColors[idx] },
              formatter: val => {
                if (val === 0) return '0';
                return Math.floor(val).toLocaleString();
              }
            },
            title: {
              text: s.name,
              style: { color: yaxisColors[idx] }
            },
            opposite: idx > 0
          };
        }
      });
    } else {
      console.log('⚠️ [ApexMixedChart] series.length가 0이어서 yaxis를 생성하지 않음');
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
          label: { show: false } // 점선만 표시, label은 숨김
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

    // 기본 ApexCharts 스타일 tooltip
    const tooltipConfig = {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: false,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        // 날짜 포맷팅
        const category = categories[dataPointIndex];
        let dateStr = '';
        if (category) {
          const catStr = String(category);
          if (catStr.length === 6) {
            const year = catStr.substring(0, 4);
            const month = catStr.substring(4, 6);
            dateStr = `${year}-${month}`;
          } else {
            dateStr = catStr;
          }
        }
        
        // ApexCharts 기본 스타일과 동일하게 구성
        let html = '<div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">' + dateStr + '</div>';
        
        // 각 시리즈별로 값 표시
        w.config.series.forEach((s, idx) => {
          const seriesType = s.type || 'line';
          const seriesName = s.name || '';
          const seriesColor = w.config.colors[idx] || '#000';
          const seriesDataRaw = s.data || [];
          
          // 실제 데이터 가져오기
          let actualValue = series[idx] ? series[idx][dataPointIndex] : null;
          const dataPoint = seriesDataRaw[dataPointIndex];
          if (dataPoint && typeof dataPoint === 'object' && 'y' in dataPoint) {
            actualValue = dataPoint.y;
          }
          
          // 소숫점 2자리에서 반올림
          if (actualValue !== null && actualValue !== undefined && !isNaN(actualValue)) {
            actualValue = Math.round(actualValue * 10) / 10;
          }
          
          let displayValue = '';
          
          // null/undefined 처리
          if (actualValue === null || actualValue === undefined) {
            displayValue = '없음';
          }
          // 0인 경우 처리
          else if (actualValue === 0) {
            displayValue = '0';
          }
          // 일반 값 처리
          else {
            displayValue = Number(actualValue).toLocaleString();
          }
          
          // ApexCharts 기본 스타일 유지
          html += '<div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ' + (idx + 1) + '; display: flex;">';
          html += '<span class="apexcharts-tooltip-marker" style="background-color: ' + seriesColor + ';"></span>';
          html += '<div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">';
          html += '<div class="apexcharts-tooltip-y-group">';
          html += '<span class="apexcharts-tooltip-text-y-label">' + seriesName + ': </span>';
          html += '<span class="apexcharts-tooltip-text-y-value">' + displayValue + '</span>';
          html += '</div>';
          html += '</div>';
          html += '</div>';
        });
        
        return html;
      }
    };

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
      tooltip: tooltipConfig,
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