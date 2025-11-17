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

const ApexMixedChart = forwardRef(function ApexMixedChart({ chartData, chartColors = [], ctype = {}, colorMapping = {}, chartTypeMapping = {}, policyAnnotations = [] }, ref) {
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
        
        // ctype을 객체로 받아 statblid로 접근
        let currentCtype = ctype && typeof ctype === 'object' && !Array.isArray(ctype)
          ? ctype[dataset.statblid]
          : undefined;
        //console.log(`[ApexMixedChart] series[${index}] currentCtype:`, currentCtype);
      
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
    // 시리즈별 색상 - 같은 statblid인 경우 명도를 조절하여 구분
    const statblidGroups = {};
    series.forEach((seriesItem, idx) => {
      const sid = seriesItem.statblid || 'unknown';
      if (!statblidGroups[sid]) statblidGroups[sid] = [];
      statblidGroups[sid].push(idx);
    });
    
    // RGB to HSL 변환 함수
    const hexToHSL = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return { h: 0, s: 0, l: 50 };
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return { h: h * 360, s: s * 100, l: l * 100 };
    };
    
    // HSL to RGB 변환 함수
    const hslToHex = (h, s, l) => {
      s /= 100;
      l /= 100;
      
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      
      const r = Math.round(255 * f(0));
      const g = Math.round(255 * f(8));
      const b = Math.round(255 * f(4));
      
      return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    };
    
    const dynamicColors = series.map((seriesItem, idx) => {
      let baseColor = colorMapping?.[seriesItem.statblid];
      if (!baseColor) baseColor = chartColors[idx];
      if (!baseColor) baseColor = '#1976d2';
      
      // 같은 statblid 그룹 내에서 몇 번째인지 확인
      const sid = seriesItem.statblid || 'unknown';
      const groupIndices = statblidGroups[sid];
      const positionInGroup = groupIndices.indexOf(idx);
      const groupSize = groupIndices.length;
      
      // 그룹 내에 여러 시리즈가 있으면 명도를 조절
      if (groupSize > 1) {
        const hsl = hexToHSL(baseColor);
        // 명도를 20%~80% 범위에서 균등 분배
        const lightnessStep = 60 / (groupSize - 1);
        const newLightness = 20 + (positionInGroup * lightnessStep);
        return hslToHex(hsl.h, hsl.s, newLightness);
      }
      
      return baseColor;
    });
     
    // Y축 설정 - 지수 관련은 같은 축 공유, 가격은 별도 축
    let yaxis = null;
    if (series.length > 0) {
      const yaxisColors = dynamicColors.slice(0, series.length);
      
      // ctype이 제일 많이 있는 것 계산 
      const ctypeCount = {};
      series.forEach(s => {
        if (s.ctype) {
          ctypeCount[s.ctype] = (ctypeCount[s.ctype] || 0) + 1;
        }
      });
      let maxCtype = null;
      let maxCount = 0;
      Object.entries(ctypeCount).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCtype = key;
          maxCount = count;
        }
      });
      console.log('[ApexMixedChart] 가장 많은 ctype:', maxCtype, 'count:', maxCount);
      
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
        const isIndex = (s.ctype === 'dt-index');
        const isPercent = (s.ctype === 'dt-percent');
        
        if (isIndex) {
          // 지수, 금액 시리즈 Y축 공유
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
            opposite: false, // Y축을 차트의 왼쪽에 표시
            // 같은 시리즈에 동일한 min/max 적용하여 스케일 동기화
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
            opposite: true  // Y축을 차트의 오른쪽에 표시
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
    // yyyymmdd → yyyymm 변환 함수
    function toDateString(yyyymmdd) {
      if (!yyyymmdd) return '';
      const str = String(yyyymmdd);
      if (str.length !== 8) return str;
      const year = str.substring(0, 4);
      const month = str.substring(4, 6);
      return `${year}${month}`;
    }

    let annotations = { xaxis: [], points: [] };
    if (Array.isArray(policyAnnotations) && policyAnnotations.length > 0 && categories && categories.length > 0) {

      annotations.xaxis = policyAnnotations.map((policy, idx) => {
        // 정책 날짜를 yyyymm 로 변환
        const normDate = toDateString(policy.date);
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
        const normDate = toDateString(policy.date);
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
          },
          formatter: function(value) {
            // value가 yyyy-mm-dd 또는 yyyy-mm 형태일 때 yyyy-mm만 추출
            if (typeof value === 'string' && value.length === 6) {
              return value.slice(0, 4) + '-' + value.slice(4, 6);
            }
            return value;
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