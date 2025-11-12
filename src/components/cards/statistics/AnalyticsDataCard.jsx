'use client';

import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// material-ui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// third-party
import dynamic from 'next/dynamic';

// Dynamic import for ApexCharts (SSR 방지)
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <Box sx={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</Box>
});

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

// ==============================|| STATISTICS - ECOMMERCE CARD ||============================== //

export default function AnalyticsDataCard({ 
  color = 'primary', 
  title, 
  statblid, 
  isActiveInChart = false,
  onRemoveFromChart,
  onResetCard,
  option1: option1Prop = '', // 첫번째 옵션
  onOption1Change,
  option1Options = [],
  option2: option2Prop = '', // 두번째 옵션
  onOption2Change,
  option2Options = [],
  chartData = [],
  cardIndex = 0,
  chartColor = null,
  chartType = null,
  ctype = null
}) {
  // 클라이언트 사이드에서만 차트 렌더링
  const [isClient, setIsClient] = useState(false);
  const [chartReady, setChartReady] = useState(false);

    // 드롭다운의 디폴트 값 처리
  const [option1, setOption1] = useState(option1Prop || (option1Options.length > 0 ? option1Options[0] : ''));
  const [option2, setOption2] = useState(option2Prop || (option2Options.length > 0 ? option2Options[0] : ''));

  useEffect(() => {
    // option1Options가 바뀌면 첫번째 값으로 초기화
    if (option1Options.length > 0 && !option1Options.includes(option1)) {
      setOption1(option1Options[0]);
      if (onOption1Change) onOption1Change(option1Options[0]);
    }
  }, [option1Options]);

  useEffect(() => {
    // option2Options가 바뀌면 첫번째 값으로 초기화
    if (option2Options.length > 0 && !option2Options.includes(option2)) {
      setOption2(option2Options[0]);
      if (onOption2Change) onOption2Change(option2Options[0]);
    }
  }, [option2Options]);

  // 드롭다운 값 변경 핸들러
  const handleOption1Change = (e) => {
    setOption1(e.target.value);
    if (onOption1Change) onOption1Change(e.target.value);
  };
  const handleOption2Change = (e) => {
    setOption2(e.target.value);
    if (onOption2Change) onOption2Change(e.target.value);
  };

  useEffect(() => {
    setIsClient(true);
    // 차트 초기화를 위한 약간의 지연
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 20);
    
    return () => clearTimeout(timer);
  }, []);

  // chartData나 chartType이 변경될 때 차트 재초기화 (지연 시간 증가 및 조건 개선)
  useEffect(() => {
    if (isClient && (chartData.length > 0 || chartType)) {
      setChartReady(false);
      const timer = setTimeout(() => {
        setChartReady(true);
      }, 20); 
      
      return () => clearTimeout(timer);
    }
  }, [chartData.length, chartType, isClient]); // cardIndex 제거하여 불필요한 리렌더링 방지

  // 디버깅용: isActiveInChart 상태 확인
  // useEffect(() => {
  //   console.log(`Card ${cardIndex} - isActiveInChart:`, isActiveInChart, 'onRemoveFromChart:', !!onRemoveFromChart);
  // }, [isActiveInChart, onRemoveFromChart, cardIndex]);

  // 카드 인덱스에 따라 차트 타입 결정 (chartType prop이 있으면 우선 사용)
  const getChartType = (index) => {
    switch (index % 3) {
      case 0: return 'line';
      case 1: return 'line';
      case 2: return 'line';
      default: return 'line';
    }
  };
  
  const finalChartType = chartType || getChartType(cardIndex);
  
  // 간단한 차트를 위한 샘플 데이터 (카드별로 고유한 데이터)
  const getDefaultData = useMemo(() => {
    // 카드별로 다른 기본 데이터 생성
    const baseData = [
      [50, 50, 50, 50, 50, 50, 50, 50, 50, 50], // 카드 0
      [50, 50, 50, 50, 50, 50, 50, 50, 50, 50], // 카드 1
      [50, 50, 50, 50, 50, 50, 50, 50, 50, 50]  // 카드 2
    ];

    return baseData[cardIndex % 3] || baseData[0];
  }, [cardIndex]);
  
  // 디버깅용: 차트 데이터 확인
  // useEffect(() => {
  //   console.log(`Card ${cardIndex} - chartData:`, chartData, 'length:', chartData?.length);
  //   console.log(`Card ${cardIndex} - statblid:`, statblid);
  // }, [chartData, cardIndex, statblid]);
  
  const sparklineData = (Array.isArray(chartData) && chartData.length > 0) ? chartData : getDefaultData;
  
  // 차트 색상 결정 (chartColor prop이 있으면 우선 사용, 없으면 cardIndex 기반)
  const finalChartColor = useMemo(() => {
    return chartColor || (['#1976d2', '#2e7d32', '#d32f2f'][cardIndex % 3]);
  }, [chartColor, cardIndex]);
  
  // 간단한 하드코딩된 sparkline 옵션
  const sparklineOptions = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: [finalChartColor],
    tooltip: {
      enabled: false
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      show: false
    }
  };

  return (
    <MainCard 
      content={false}
      sx={{ 
        position: 'relative',
        border: isActiveInChart ? '2px solid #b0b3b8' : '1px solid #e0e0e0',
        backgroundColor: isActiveInChart ? '#f3f7ff' : 'inherit'
      }}
    >
      {/* 헤더 영역 */}
      <Box sx={{
        height: 36,
        background: (ctype === 'dt-index') ? 'rgba(255, 183, 77, 1)'
          : (ctype === 'dt-percent') ? 'rgba(186, 104, 200, 1)'
          : (ctype === 'dt-count') ? 'rgba(229, 115, 115, 1)'
          : (ctype === 'dt-price') ? 'rgba(77, 208, 225, 1)'
          : (ctype === 'dt-hCount') ? 'rgba(174, 213, 129, 1)'
          : 'rgba(176,179,184,0.55)',
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
        borderBottom: '1px solid #b0b3b8',
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontWeight: 600,
        fontSize: 13,
        color: '#fff',
        fontStyle: 'italic',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {title ? title : '제목 없음'}
      </Box>
      {isActiveInChart && onRemoveFromChart && (
        <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
          <Tooltip title="차트에서 제거">
            <IconButton 
              size="small" 
              onClick={() => {
                // 카드 데이터 리셋 (제목, 그래프 초기화)
                if (onResetCard) {
                  onResetCard(cardIndex);
                }
                // 미니차트 리셋
                setChartReady(false);
                setTimeout(() => {
                  setChartReady(true);
                }, 100);
                // 메인차트에서 제거
                onRemoveFromChart();
              }}
              sx={{ 
                backgroundColor: 'error.main',
                color: 'white',
                width: 20,
                height: 20,
                border: '1px solid #ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                '&:hover': { 
                  backgroundColor: 'error.dark',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <CloseOutlined style={{ fontSize: '12px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box sx={{ p: 2.25 }}>
        <Stack sx={{ gap: 0.5 }}>
          {/* 동적 차트 타입 (column, area, line) */}
          <Box sx={{ height: 60, mt: 1, mb: 1 }}>
            {isClient && chartReady ? (
              <ReactApexChart 
                options={sparklineOptions} 
                series={[{ 
                  name: title || 'Data',
                  data: sparklineData 
                }]} 
                type="line"
                height={60}
                key={`${statblid}-${cardIndex}-${finalChartType}-${chartReady}-${sparklineData.length}`}
              />
            ) : (
              <Box sx={{ 
                height: 60, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary',
                fontSize: '12px'
              }}>
                차트 로딩 중...
              </Box>
            )}
          </Box>
          {/* 옵션1, 옵션2 선택 드롭다운 */}
          {(option1Options.length > 0 || option2Options.length > 0) && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {/* 옵션1 드롭다운 */}
              {option1Options.length > 0 && (
                <FormControl size="small" sx={{flex: 1, minWidth: 80, width: '50%'}}> {/* width: option2Options.length > 0 ? '50%'  : '50%', marginLeft: option2Options.length > 0 ? 0 : '50%' */}
                  <Select
                    labelId={`option1-label-${statblid}`}
                    value={option1}
                    onChange={handleOption1Change}
                    sx={{ backgroundColor: 'background.paper' }}
                  >
                    {option1Options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {/* 옵션2 드롭다운 */}
              {option2Options.length > 0 && (
                <FormControl size="small" sx={{flex: 1, minWidth: 80, width: '50%'}}>
                  <Select
                    labelId={`option2-label-${statblid}`}
                    value={option2}
                    onChange={handleOption2Change}
                    sx={{ backgroundColor: 'background.paper' }}
                  >
                    {option2Options.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </Stack>
      </Box>
    </MainCard>
  );
}

AnalyticsDataCard.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  statblid: PropTypes.string,
  isActiveInChart: PropTypes.bool,
  onRemoveFromChart: PropTypes.func,
  onResetCard: PropTypes.func,
  option1: PropTypes.string,
  onOption1Change: PropTypes.func,
  option1Options: PropTypes.array,
  option2: PropTypes.string,
  onOption2Change: PropTypes.func,
  option2Options: PropTypes.array,
  chartData: PropTypes.array,
  cardIndex: PropTypes.number,
  chartColor: PropTypes.string,
  chartType: PropTypes.string,
  ctype: PropTypes.string
};