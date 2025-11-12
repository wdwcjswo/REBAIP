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
import Typography from '@mui/material/Typography';

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
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: false // 동적 애니메이션 비활성화로 성능 향상
      }
    },
    zoom: {
      enabled: true,
      type: 'x',
      autoScaleYaxis: true,
      zoomedArea: {
        fill: {
          color: '#90CAF9',
          opacity: 0.4
        },
        stroke: {
          color: '#0D47A1',
          opacity: 0.4,
          width: 1
        }
      }
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      },
      autoSelected: 'zoom'
    },
    redrawOnParentResize: true,
    redrawOnWindowResize: true
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

// ==============================|| APEXCHART - REB ||============================== //

const ApexRebChart = forwardRef(function ApexRebChart({ chartData, policyAnnotations = [], visibleSeries = { 매물호가: true, 매물량: true, 실거래: true, 심리분석: false } }, ref) {
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.grey[200];
  const secondary = theme.palette.primary[700];

  // 동적 차트 id (여러 인스턴스 대비)
  const [chartId] = useState('chart-' + Math.random().toString(36).substring(2, 9));

  // 데이터 라벨 기반 자동 차트 타입 결정 함수
  const determineChartType = (label, data) => {
    if (!label) return 'line';
    
    const labelLower = label.toLowerCase();
    
    // 가격 범위 데이터 (최저가/최고가) -> rangeArea
    if (labelLower.includes('최저가') || labelLower.includes('최고가')) {
      return 'rangeArea';
    }
    
    // 매물량/거래량 데이터 -> column (bar)
    if (labelLower.includes('매물량') || labelLower.includes('거래량') ) {
      return 'column';
    }
    
    // 실거래가 데이터 -> scatter
    if (labelLower.includes('실거래가') || labelLower.includes('거래가')) {
      return 'scatter';
    }
    
    // 심리분석 데이터 -> candlestick
    if (labelLower.includes('심리분석')) {
      return 'candlestick';
    }
    
    // 기본값은 line
    return 'line';
  };

  // chartData에서 series, categories를 직접 계산 (useMemo)
  const series = useMemo(() => {
    //console.log('🔍 [ApexRebChart] chartData 받음:', chartData);
    
    if (!chartData?.data?.datasets || !Array.isArray(chartData.data.datasets)) {
      console.log('⚠️ [ApexRebChart] No datasets found');
      return [];
    }

    const allLabels = chartData.data.labels || [];
    const generatedSeries = [];
    
    // 1. 데이터셋 분류
    const classifyDataset = (ds) => {
      const label = (ds.label || ds.name || '').toLowerCase();
      
      if (label.includes('심리분석') || label.includes('candlestick')) {
        return 'candlestick';
      }
      if (label.includes('최저가') || label.includes('min')) {
        return 'minPrice';
      }
      if (label.includes('최고가') || label.includes('max')) {
        return 'maxPrice';
      }
      return 'other';
    };

    // 데이터셋 분류
    const datasets = {
      candlestick: null,
      minPrice: null,
      maxPrice: null,
      others: []
    };

    chartData.data.datasets.forEach(ds => {
      const type = classifyDataset(ds);
      if (type === 'candlestick') {
        datasets.candlestick = ds;
      } else if (type === 'minPrice') {
        datasets.minPrice = ds;
      } else if (type === 'maxPrice') {
        datasets.maxPrice = ds;
      } else {
        datasets.others.push(ds);
      }
    });

    // 2. 캔들스틱 데이터셋 처리
    if (datasets.candlestick) {
      const candlestickData = Array.isArray(datasets.candlestick.data) ? datasets.candlestick.data : [];
      
      generatedSeries.push({
        name: datasets.candlestick.label || datasets.candlestick.name || '심리분석',
        label: datasets.candlestick.label || datasets.candlestick.name || '심리분석',
        type: 'candlestick',
        data: candlestickData // {x: date, y: [o, h, l, c]} 형태 그대로 전달
      });
    }

    // 3. 최저가/최고가 RangeArea 데이터셋 처리
    if (datasets.minPrice && datasets.maxPrice) {
      
      // 아파트명 추출
      const minLabel = datasets.minPrice.label || datasets.minPrice.name || '';
      const apartmentName = minLabel.replace(/최저가|최고가/gi, '').trim();
      const apartmentPrefix = apartmentName ? `${apartmentName} ` : '';
      
      const minData = Array.isArray(datasets.minPrice.data) ? datasets.minPrice.data : [];
      const maxData = Array.isArray(datasets.maxPrice.data) ? datasets.maxPrice.data : [];
      
      // 객체 형태인지 확인
      const isObjectData = minData.length > 0 && typeof minData[0] === 'object' && minData[0] !== null && 'x' in minData[0];
      
      const rangeData = [];
      
      if (isObjectData) {
        // 객체 형태: {x: date, y: value}
        // x값이 timestamp인지 확인 (allLabels가 timestamp면 데이터도 timestamp로 매칭)
        const isTimestamp = typeof allLabels[0] === 'number';
        
        const minMap = new Map(minData.map(item => [isTimestamp ? item.x : String(item.x), item.y]));
        const maxMap = new Map(maxData.map(item => [isTimestamp ? item.x : String(item.x), item.y]));
        
        allLabels.forEach(category => {
          const categoryKey = isTimestamp ? category : String(category);
          const minVal = minMap.get(categoryKey);
          const maxVal = maxMap.get(categoryKey);
          
          // 유효성 검증
          const validMin = (minVal !== null && minVal !== undefined && !isNaN(minVal)) ? Number(minVal) : null;
          const validMax = (maxVal !== null && maxVal !== undefined && !isNaN(maxVal)) ? Number(maxVal) : null;
          
          rangeData.push({
            x: category, // timestamp 또는 문자열 그대로 사용
            y: (validMin !== null && validMax !== null) ? [validMin, validMax] : null
          });
        });
      } else {
        // 배열 형태
        allLabels.forEach((category, i) => {
          const minVal = i < minData.length ? minData[i] : null;
          const maxVal = i < maxData.length ? maxData[i] : null;
          
          // 유효성 검증
          const validMin = (minVal !== null && minVal !== undefined && !isNaN(minVal)) ? Number(minVal) : null;
          const validMax = (maxVal !== null && maxVal !== undefined && !isNaN(maxVal)) ? Number(maxVal) : null;
          
          rangeData.push({
            x: category, // timestamp 또는 문자열 그대로 사용
            y: (validMin !== null && validMax !== null) ? [validMin, validMax] : null
          });
        });
      }
      
      generatedSeries.push({
        name: `${apartmentPrefix}호가`,
        label: `${apartmentPrefix}호가`,
        type: 'rangeArea',
        data: rangeData
      });
    }

    // 4. 기타 데이터셋 처리 (매물량, 실거래 등)
    datasets.others.forEach((dataset, index) => {
      const label = dataset.label || dataset.name || '';
      const originalData = Array.isArray(dataset.data) ? dataset.data : [];
      const chartType = determineChartType(label, originalData);
      if (chartType === 'scatter') {
        // 실거래가(혹은 scatter)는 중복 x값 허용: 원본 배열 그대로 사용
        generatedSeries.push({
          name: dataset.label || dataset.name || `데이터 ${index + 1}`,
          label: dataset.label || dataset.name || `데이터 ${index + 1}`,
          type: chartType,
          data: originalData.filter(item => item?.x && item.y !== null && item.y !== undefined && !isNaN(item.y))
        });
      } else {
        // 기존 방식 유지
        const isObjectData = originalData.length > 0 && typeof originalData[0] === 'object' && originalData[0] !== null && 'x' in originalData[0];
        const normalizedData = [];
        if (isObjectData) {
          const isTimestamp = typeof allLabels[0] === 'number';
          const dataMap = new Map();
          originalData.forEach(item => {
            if (item?.x && item.y !== null && item.y !== undefined && !isNaN(item.y)) {
              const key = isTimestamp ? item.x : String(item.x);
              dataMap.set(key, Number(item.y));
            }
          });
          allLabels.forEach(category => {
            const categoryKey = isTimestamp ? category : String(category);
            normalizedData.push({
              x: category, // timestamp 또는 문자열 그대로 사용
              y: dataMap.get(categoryKey) || null
            });
          });
        } else {
          allLabels.forEach((category, i) => {
            const val = i < originalData.length ? originalData[i] : null;
            normalizedData.push({
              x: category, // timestamp 또는 문자열 그대로 사용
              y: (val !== null && val !== undefined && !isNaN(val)) ? Number(val) : null
            });
          });
        }
        generatedSeries.push({
          name: dataset.label || dataset.name || `데이터 ${index + 1}`,
          label: dataset.label || dataset.name || `데이터 ${index + 1}`,
          type: chartType,
          data: normalizedData
        });
      }
    });

    // 5. visibleSeries에 따라 시리즈 필터링
    const filteredSeries = generatedSeries.filter(s => {
      const nameLower = (s.name || '').toLowerCase();
      
      // 매물호가 관련
      if (nameLower.includes('매물호가') || nameLower.includes('호가') || 
          nameLower.includes('최저가') || nameLower.includes('최고가')) {
        return visibleSeries.매물호가;
      }
      
      // 매물량 관련
      if (nameLower.includes('매물량') || nameLower.includes('물량')) {
        return visibleSeries.매물량;
      }
      
      // 실거래 관련
      if (nameLower.includes('실거래') || nameLower.includes('거래가')) {
        return visibleSeries.실거래;
      }
      
      // 심리분석 관련
      if (nameLower.includes('심리분석') || nameLower.includes('candlestick')) {
        return visibleSeries.심리분석;
      }

      // 기타는 항상 표시
      return true;
    });
    
    //console.log('✅ [ApexRebChart] 생성된 시리즈:', filteredSeries.length);
    return filteredSeries;
  }, [chartData, visibleSeries]);

  const categories = useMemo(() => {   
    // labels는 chartData.data.labels
    if (chartData?.data?.labels && Array.isArray(chartData.data.labels) && chartData.data.labels.length > 0) {
      return chartData.data.labels;
    }

    return [];
  }, [chartData]);


  // options를 useMemo로 계산하여 바로 Chart에 넘김
  const options = useMemo(() => {
    // 시리즈별 색상을 이름 기반으로 고정
    const getSeriesColor = (seriesName) => {
      const nameLower = (seriesName || '').toLowerCase();
      
      // 매물호가 (최저가/최고가 포함) - 빨간색
      if (nameLower.includes('매물호가') || nameLower.includes('호가') || 
          nameLower.includes('최저가') || nameLower.includes('최고가')) {
        return '#ef5350'; // 빨간색
      }
      
      // 실거래 - 초록색
      if (nameLower.includes('실거래') || nameLower.includes('거래가')) {
        return '#66bb6a'; // 초록색
      }
      
      // 매물량 - 파란색
      if (nameLower.includes('매물량') || nameLower.includes('물량')) {
        return '#42a5f5'; // 파란색
      }
      // 심리분석 - 보라색
      if (nameLower.includes('심리분석')) {
        return '#d405f0ff'; // 보라색
      }
      // 기타 - 노란색
      return '#bdf005ff';
    };
    
    const dynamicColors = series.map(s => getSeriesColor(s.name));

    // Y축 설정 - 가격 관련은 같은 축 공유, 매물량은 별도 축
    let yaxis = null;
    if (series.length > 0) {
      const yaxisColors = dynamicColors.slice(0, series.length);

      // isPrice인 시리즈들의 전체 데이터 범위 계산
      let priceMin = Infinity;
      let priceMax = -Infinity;
      series.forEach(s => {
        if ((s.type === 'rangeArea' || s.type === 'scatter') && Array.isArray(s.data)) {
          s.data.forEach(val => {
            const numVal = (typeof val === 'object' && val !== null && 'y' in val) ? val.y : val;
            if (numVal !== null && numVal !== undefined && !isNaN(numVal)) {
              priceMin = Math.min(priceMin, numVal);
              priceMax = Math.max(priceMax, numVal);
            }
          });
        }
      });
      
      // 유효한 범위가 없으면 undefined로 설정
      if (priceMin === Infinity || priceMax === -Infinity) {
        priceMin = undefined;
        priceMax = undefined;
      } else {
        // 약간의 여백 추가 (10%)
        const range = priceMax - priceMin;
        const paddedMin = priceMin - range * 0.1;
        const paddedMax = priceMax + range * 0.1;
        
        // 원하는 눈금 개수 (예: 6개)
        const desiredTicks = 6;
        
        // 현재 범위를 눈금 개수로 나눈 간격
        const rawInterval = (paddedMax - paddedMin) / (desiredTicks - 1);
        
        // 데이터 범위에 따라 적절한 단위 선택
        let unitSize = 1000000;
        if (paddedMax <= 100000000) {
          // 1억 이하: 천만원(10,000,000) 단위
          unitSize = 10000000;
        } else if (paddedMax <= 500000000) {
          // 5억 이하: 5천만원(50,000,000) 단위
          unitSize = 50000000;
        } else if (paddedMax <= 1000000000) {
          // 10억 이하: 1억(100,000,000) 단위
          unitSize = 100000000;
        } else if (paddedMax <= 5000000000) {
          // 50억 이하: 5억(500,000,000) 단위
          unitSize = 500000000;
        } else if (paddedMax <= 10000000000) {
          // 100억 이하: 10억(1000,000,000) 단위
          unitSize = 1000000000;
        } 
        
        // 간격을 선택된 단위의 배수로 올림
        const tickInterval = Math.ceil(rawInterval / unitSize) * unitSize;
        
        // 새로운 min/max 계산 (선택된 단위 배수 간격 기준)
        priceMin = Math.floor(paddedMin / tickInterval) * tickInterval;
        priceMax = priceMin + (tickInterval * (desiredTicks - 1));
      }
      
      // 시리즈별로 yaxis 생성하되, 가격 관련은 첫 번째 Y축 공유
      yaxis = series.map((s, idx) => {
        const isPrice = (s.type === 'rangeArea' || s.type === 'scatter');
        const isVolume = (s.type === 'column');
        
        if (isPrice) {
          // 가격 관련 시리즈는 각자의 이름 사용하되, Y축은 공유
          const firstPriceIdx = series.findIndex(ser => ser.type === 'rangeArea' || ser.type === 'scatter');
          return {
            seriesName: s.name, // 각 시리즈의 고유한 이름 사용
            axisTicks: { show: idx === firstPriceIdx },
            axisBorder: { show: idx === firstPriceIdx, color: yaxisColors[firstPriceIdx] },
            labels: {
              show: idx === firstPriceIdx,
              style: { colors: yaxisColors[firstPriceIdx] },
              formatter: val => {
                if (val === 0) return '0';
                return Math.floor(val).toLocaleString();
              }
            },
            title: {
              text: idx === firstPriceIdx ? '가격 (원)' : undefined,
              style: { color: yaxisColors[firstPriceIdx] }
            },
            opposite: false,
           // 모든 isPrice 시리즈에 동일한 min/max 적용하여 스케일 동기화
            min: priceMin,
            max: priceMax
          };
        } else if (isVolume) {
          // 매물량은 별도 Y축
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
              text: '매물량 (건)',
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
    } 

    // yyyymmdd → yyyy-mm-dd 변환 함수
    function toDateString(yyyymmdd) {
      if (!yyyymmdd) return '';
      const str = String(yyyymmdd);
      if (str.length !== 8) return str;
      const year = str.substring(0, 4);
      const month = str.substring(4, 6);
      const day = str.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    let annotations = { xaxis: [] };
    if (Array.isArray(policyAnnotations) && policyAnnotations.length > 0 && categories && categories.length > 0) {
      annotations.xaxis = policyAnnotations.map((policy, idx) => {
        // 정책 날짜를 yyyy-mm-dd로 변환
        const normDate = toDateString(policy.date);

        // categories에서 매칭
        const catIdx = categories.findIndex(cat => String(cat) === normDate); 

        if (catIdx === -1) return null;
        return {
          x: Date.parse(categories[catIdx]),
          borderColor: '#0e0d0dff',
          strokeDashArray: 6,
          opacity: 1,
          width: 2,
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
            offsetY: 20,
            offsetX: 0
          }
        };
      }).filter(Boolean);
     
    }

    // 차트 타입별 plotOptions 및 마커 설정
    const hasScatter = series.some(s => s.type === 'scatter');
    const hasColumn = series.some(s => s.type === 'column');
    const hasRangeArea = series.some(s => s.type === 'rangeArea');

    const plotOptions = {};
    
    // Column 차트 설정
    if (hasColumn) {
      plotOptions.bar = {
        columnWidth: '60%',
        borderRadius: 2,
        dataLabels: {
          position: 'top',
          offsetY: -10
        }
      };
    }
    
    // RangeArea 차트 설정
    if (hasRangeArea) {
      plotOptions.area = {
        fillTo: 'origin'
      };
    }

    // DataLabels 설정 (column 차트에서만 활성화, 데이터 포인트가 적을 때만)
    const totalDataPoints = series.reduce((acc, s) => acc + (Array.isArray(s.data) ? s.data.length : 0), 0);
    const shouldShowDataLabels = hasColumn && totalDataPoints <= 50; // 50개 이하일 때만 표시
    
    const dataLabelsConfig = {
      enabled: shouldShowDataLabels,
      formatter: function(val, { seriesIndex, w }) {
        if (w.config.series[seriesIndex]?.type === 'column' && val > 0) {
          // 값이 큰 경우에만 표시 (성능 최적화)
          const maxVal = Math.max(...w.config.series[seriesIndex].data);
          if (val < maxVal * 0.1) return ''; // 최대값의 10% 미만은 표시하지 않음
          return val.toLocaleString();
        }
        return '';
      },
      offsetY: -10,
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#304758']
      },
      background: {
        enabled: false
      }
    };

    // 마커 설정 (scatter 차트용, 성능 최적화)
    const markersConfig = {
      colors: dynamicColors,
      size: series.map(s => {
        if (s.type === 'scatter') return 5; // scatter 마커 크기를 조금 작게
        if (s.type === 'rangeArea') return 0; // rangeArea는 마커 없음 (선만 표시)
        if (s.type === 'line' && totalDataPoints > 100) return 0; // 데이터가 많으면 마커 숨김
        return 4;
      }),
      strokeWidth: series.map(s => s.type === 'scatter' ? 2 : 1),
      strokeColors: series.map(s => s.type === 'scatter' ? '#fff' : 'transparent'),
      hover: {
        size: series.map(s => {
          if (s.type === 'scatter') return 7; // hover 시 살짝 크게
          if (s.type === 'rangeArea') return 0; // rangeArea는 hover시에도 마커 없음
          return 6;
        }),
        sizeOffset: 2
      },
      discrete: [] // 개별 마커 설정 비활성화로 성능 향상
    };

    // 기본 ApexCharts 스타일 tooltip
    const tooltipConfig = {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: false,
      offsetY: -50, // 툴팁을 위로 50px 이동
      x: {
        format: 'yyyy-MM-dd'
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        let dateValue = null;
        
        // 현재 시리즈가 scatter인지 확인하고, scatter면 실제 데이터의 x값 사용 
        //scatter 시리즈는 중복 x값을 허용하기 때문에 categories 배열의 인덱스와 실제 데이터의 위치가 다를 수 있음
        if (w && w.config && w.config.series) {
          const currentSeries = w.config.series[seriesIndex];
          if (currentSeries && currentSeries.type === 'scatter') {
            const seriesDataRaw = currentSeries.data || [];
            if (seriesDataRaw[dataPointIndex] && typeof seriesDataRaw[dataPointIndex].x !== 'undefined') {
              dateValue = seriesDataRaw[dataPointIndex].x;
            }
          } else {
            dateValue = categories[dataPointIndex];
          }
        }
        
        // 타입별 html 생성 함수
        function renderCandlestick(s, idx, seriesColor, seriesName, seriesDataRaw) {
          const dataPoint = seriesDataRaw[dataPointIndex];
          if (dataPoint && Array.isArray(dataPoint.y) && dataPoint.y.length === 4) {
            const [open, high, low, close] = dataPoint.y;
            return `
              <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ${idx + 1}; display: flex;">
                <span class="apexcharts-tooltip-marker" style="background-color: ${seriesColor};"></span>
                <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
                  <div class="apexcharts-tooltip-y-group">
                    <span class="apexcharts-tooltip-text-y-label">${seriesName}</span><br>
                    <span class="apexcharts-tooltip-text-y-label">시가: </span><span class="apexcharts-tooltip-text-y-value">${open !== null && open !== undefined ? Number(open).toLocaleString() : '-'}</span><br>
                    <span class="apexcharts-tooltip-text-y-label">고가: </span><span class="apexcharts-tooltip-text-y-value">${high !== null && high !== undefined ? Number(high).toLocaleString() : '-'}</span><br>
                    <span class="apexcharts-tooltip-text-y-label">저가: </span><span class="apexcharts-tooltip-text-y-value">${low !== null && low !== undefined ? Number(low).toLocaleString() : '-'}</span><br>
                    <span class="apexcharts-tooltip-text-y-label">종가: </span><span class="apexcharts-tooltip-text-y-value">${close !== null && close !== undefined ? Number(close).toLocaleString() : '-'}</span>
                  </div>
                </div>
              </div>
            `;
          }
          return '';
        }

        function renderScatter(s, idx, seriesColor, seriesName, seriesDataRaw) {
          // dateValue를 기준으로 동일 날짜 데이터 찾기
          let sameDateItems = [];
          if (dateValue !== null && typeof dateValue !== 'undefined') {
            sameDateItems = seriesDataRaw.filter(item => {
              if (!item || typeof item.x === 'undefined') return false;
              // 날짜 타입이 다를 수 있으니 문자열로 변환해서 비교
              return String(item.x) === String(dateValue);
            });
          }

          let innerHtml = '';
          if (sameDateItems.length === 0) {
            innerHtml = `<span class="apexcharts-tooltip-text-y-label">${seriesName}: </span><span class="apexcharts-tooltip-text-y-value">없음</span>`;
          } else if (sameDateItems.length === 1) {
            innerHtml = `<span class="apexcharts-tooltip-text-y-label">${seriesName}: </span><span class="apexcharts-tooltip-text-y-value">${Number(sameDateItems[0].y).toLocaleString()}</span>`;
          } else if (sameDateItems.length === 2) {
            innerHtml = `<span class="apexcharts-tooltip-text-y-label">${seriesName}: </span>` +
              sameDateItems.map(item => `<span class=\"apexcharts-tooltip-text-y-value\" style=\"margin-right: 8px;\">${Number(item.y).toLocaleString()}</span>`).join('');
          } else {
            innerHtml = `<span class="apexcharts-tooltip-text-y-label" style="margin-bottom: 4px; display: block;">${seriesName}: </span>`;
            const itemsPerRow = 3;
            for (let i = 0; i < sameDateItems.length; i += itemsPerRow) {
              const rowItems = sameDateItems.slice(i, i + itemsPerRow);
              innerHtml += '<div style="margin-bottom: 2px;">' +
                rowItems.map(item => `<span class=\"apexcharts-tooltip-text-y-value\" style=\"margin-right: 8px;\">${Number(item.y).toLocaleString()}</span>`).join('') +
                '</div>';
            }
          }
          return `
            <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ${idx + 1}; display: flex;">
              <span class="apexcharts-tooltip-marker" style="background-color: ${seriesColor};"></span>
              <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; max-width: 350px;">
                <div class="apexcharts-tooltip-y-group">${innerHtml}</div>
              </div>
            </div>
          `;
        }

        function renderRangeArea(s, idx, seriesColor, seriesName, seriesDataRaw) {
          const dataPoint = seriesDataRaw[dataPointIndex];
          let displayValue = '없음';
          if (dataPoint && Array.isArray(dataPoint.y) && dataPoint.y.length === 2) {
            const [min, max] = dataPoint.y;
            if (min !== null && min !== undefined && max !== null && max !== undefined) {
              displayValue = `${Number(min).toLocaleString()} ~ ${Number(max).toLocaleString()}`;
            }
          }
          return `
            <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ${idx + 1}; display: flex;">
              <span class="apexcharts-tooltip-marker" style="background-color: ${seriesColor};"></span>
              <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
                <div class="apexcharts-tooltip-y-group">
                  <span class="apexcharts-tooltip-text-y-label">${seriesName}: </span>
                  <span class="apexcharts-tooltip-text-y-value">${displayValue}</span>
                </div>
              </div>
            </div>
          `;
        }

        function renderDefault(s, idx, seriesColor, seriesName, seriesDataRaw) {
          const dataPoint = seriesDataRaw[dataPointIndex];
          let displayValue = '없음';
          if (dataPoint && typeof dataPoint.y !== 'undefined' && dataPoint.y !== null) {
            if (dataPoint.y === 0) {
              displayValue = '0';
            } else {
              displayValue = Number(dataPoint.y).toLocaleString();
            }
          }
          return `
            <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: ${idx + 1}; display: flex;">
              <span class="apexcharts-tooltip-marker" style="background-color: ${seriesColor};"></span>
              <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
                <div class="apexcharts-tooltip-y-group">
                  <span class="apexcharts-tooltip-text-y-label">${seriesName}: </span>
                  <span class="apexcharts-tooltip-text-y-value">${displayValue}</span>
                </div>
              </div>
            </div>
          `;
        }

        // 시리즈별로 타입에 따라 html 생성
        const seriesHtmlArr = w.config.series.map((s, idx) => {
          const seriesType = s.type || 'line';
          const seriesName = s.name || '';
          const seriesColor = w.config.colors[idx] || '#000';
          const seriesDataRaw = s.data || [];
          if (seriesType === 'candlestick') {
            return renderCandlestick(s, idx, seriesColor, seriesName, seriesDataRaw);
          } else if (seriesType === 'scatter') {
            return renderScatter(s, idx, seriesColor, seriesName, seriesDataRaw);
          } else if (seriesType === 'rangeArea') {
            return renderRangeArea(s, idx, seriesColor, seriesName, seriesDataRaw);
          } else {
            return renderDefault(s, idx, seriesColor, seriesName, seriesDataRaw);
          }
        });

        return `<div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">${dateValue}</div>` + seriesHtmlArr.join('');
      }
    };

    return {
      ...mixedChartOptions,
      colors: dynamicColors,
      dataLabels: dataLabelsConfig,
      fill: {
        colors: dynamicColors,
        opacity: series.map(s => {
          if (s.type === 'rangeArea') return 0.3;
          if (s.type === 'column') return 0.9;
          if (s.type === 'scatter') return 1;
          return 0.8;
        })
      },
      stroke: {
        colors: dynamicColors,
        width: series.map(s => {
          if (s.type === 'scatter') return 0; // scatter는 stroke 없음
          if (s.type === 'column') return 1;
          if (s.type === 'rangeArea') return 1; 
          return 2;
        }),
        curve: series.map(s => s.type === 'rangeArea' ? 'smooth' : 'straight')
      },
      markers: markersConfig,
      plotOptions,
      tooltip: tooltipConfig,
      xaxis: {
        type: 'datetime',
        tickAmount: 20, // X축에 표시할 눈금 개수 
        tickPlacement: 'on',
        labels: {
          show: true,
          rotate: -45,
          rotateAlways: false,
          hideOverlappingLabels: false,
          trim: false,
          showDuplicates: true,
          datetimeUTC: false,
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary]
          },
          formatter: function(value) {
            // value는 timestamp 또는 yyyy-MM-dd 문자열
            let dateObj = typeof value === 'string' ? new Date(value) : new Date(Number(value));
            if (isNaN(dateObj.getTime())) return value;
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          }
        },
        axisTicks: {
          show: true
        },
        axisBorder: {
          show: true
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
  }, [mode, primary, line, grey200, secondary, policyAnnotations, series, categories, mixedChartOptions]);


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
            //console.log(`[exportToImage] SUCCESS at retry ${retry}`);
            return dataURI.imgURI;
          }
          // 재시도 (최대 10회)
          if (retry < 10) {
            //console.log(`[exportToImage] imgURI undefined, retrying... (${retry + 1})`);
            await new Promise(res => setTimeout(res, 200));
            return await ref.current.exportToImage(retry + 1);
          }
        } catch (e) {
          console.error('ApexCharts exportToImage error:', e);
          return null;
        }
      } else {
        if (retry < 10) {
          //console.log(`[exportToImage] window.ApexCharts not ready, retrying... (${retry + 1})`);
          await new Promise(res => setTimeout(res, 200));
          return await ref.current.exportToImage(retry + 1);
        }
      }
      //console.log('[exportToImage] FAILED after max retries');
      return null;
    }
  }), [chartId, series, categories]);

  // 강제 리렌더링을 위해 key에 annotation hash 추가 (options.annotations가 아닌 policyAnnotations 등에서 파생)
  const annotationKey = JSON.stringify(policyAnnotations || []);
  return (
    <Box id="chart" sx={{ 
      bgcolor: 'transparent',
      '& .apexcharts-legend': {
        display: 'flex !important',
        flexWrap: 'nowrap !important',
        justifyContent: 'center !important',
        overflow: 'visible !important',
        width: '100% !important',
        padding: '5px 10px !important'
      }
    }}>
      {series && Array.isArray(series) && series.length > 0 && categories && Array.isArray(categories) ? (
        <ReactApexChart
          key={chartId + annotationKey}
          options={{ ...options, chart: { ...options.chart, id: chartId }, annotations: options.annotations }}
          series={series}
          type="line"
          height={400}
        />
      ) : categories && Array.isArray(categories) && categories.length > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400,
          color: 'text.secondary',
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            표시할 데이터가 없습니다
          </Typography>
          <Typography variant="body2" color="text.disabled">
            상단의 버튼을 클릭하여 데이터를 표시하세요
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400,
          color: 'text.secondary'
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
});

export default ApexRebChart;