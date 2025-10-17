'use client';

import dynamic from 'next/dynamic';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Slider from '@mui/material/Slider';
import Rating from '@mui/material/Rating';

// react
import { useState, useEffect } from 'react';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';

// Dynamic import for ApexCharts (SSR 방지)
const ApexMixedChart = dynamic(() => import('sections/charts/apexchart/ApexMixedChart'), {
  ssr: false,
  loading: () => <CircularProgress />
});
import UsersCardChart from 'sections/dashboard/analytics/UsersCardChart';
import SalesCardChart from 'sections/dashboard/analytics/SalesCardChart';
import TransactionHistory from 'sections/dashboard/analytics/TransactionHistory';
import LabelledTasks from 'sections/dashboard/analytics/LabelledTasks';
import ReaderCard from 'sections/dashboard/analytics/ReaderCard';
import AcquisitionChannels from 'sections/dashboard/analytics/AcquisitionChannels';

// assets
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import SaleReportCard from 'sections/dashboard/analytics/SaleReportCard';

// ==============================|| DASHBOARD - DATA ANALYTICS ||============================== //


export default function DashboardDataAnalytics() {
  const [error, setError] = useState(null);
  const [showPolicyOverlay, setShowPolicyOverlay] = useState(false); // 정책자료 오버레이 상태
  const [cards, setCards] = useState([
    { title: 'OPT1', figures: '0', newdate:'202501', statblid: 'OPT1', region: '전국', color: '#1976d2', chartType: 'line' }, // 파랑
    { title: 'OPT2', figures: '0', newdate:'202501', statblid: 'OPT2', region: '전국', color: '#2e7d32', chartType: 'line' },   // 초록
    { title: 'OPT3', figures: '0', newdate:'202501', statblid: 'OPT3', region: '전국', color: '#d32f2f', chartType: 'line' }   // 빨강
  ]);
  const [chartData, setChartData] = useState(null); // 초기에는 null로 설정
  const [chartLayers, setChartLayers] = useState([]); // 차트 레이어들을 누적 저장
  const [aiQuestion, setAiQuestion] = useState(''); // AI 질문 입력
  const [selectedRegion, setSelectedRegion] = useState('전국'); // 지역 선택 상태
  // 조회 년도 범위 상태 (최근 10년, 올해 기준)
  const SLIDER_END_YEAR = new Date().getFullYear();
  const SLIDER_START_YEAR = SLIDER_END_YEAR - 9;
  const monthCount = (SLIDER_END_YEAR - SLIDER_START_YEAR) * 12 + 12; 
  const [yearRange, setYearRange] = useState([0, monthCount - 1]);

  // 카드별 고정 색상 배열 (cards에서 추출)
  const cardColors = cards.map(card => card.color);

  // 지역 옵션들
  const regionOptions = [
    '전국', '수도권', '지방권', '6대광역시', '5대광역시', '9개도', '8개도',
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  // 지역 선택 핸들러
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    console.log('선택된 지역:', event.target.value);
  };

  // 개별 카드의 지역 선택 핸들러
  const handleCardRegionChange = (cardIndex, region) => {
    setCards(prevCards => 
      prevCards.map((card, index) => 
        index === cardIndex ? { ...card, region } : card
      )
    );
    console.log(`카드 ${cardIndex + 1} 지역 변경:`, region);
  };

  // 카드 리셋 핸들러
  const handleResetCard = (cardIndex) => {
    setCards(prevCards => 
      prevCards.map((card, index) => 
        index === cardIndex 
          ? { 
              ...card, 
              title: ['OPT1', 'OPT2', 'OPT3'][cardIndex], 
              figures: '0', 
              statblid: ['OPT1', 'OPT2', 'OPT3'][cardIndex],
              chartType: 'line',
              region: '전국' 
            }
          : card
      )
    );
    console.log(`카드 ${cardIndex + 1} 리셋됨`);
  };

  // 각 카드의 차트 데이터를 가져오는 함수 (카드별로 독립적인 데이터 관리)
  const getCardChartData = (statblid, cardIndex) => {
    const layer = chartLayers.find(layer => layer.statblid === statblid);
    if (layer && layer.data && layer.data.datasets && layer.data.datasets.length > 0) {
      // 첫 번째 dataset의 데이터를 반환
      return layer.data.datasets[0].data || [];
    }
    return [];
  };
  

  //  const server = "http://172.16.10.56:8087/RAP";
  const server = "http://127.0.0.1:8087/RAP";

  // fetchChartData 함수를 독립적으로 분리 (카드별로 독립적인 데이터 관리)
  const fetchChartData = async (statblid, cardIndex) => {
    try {
      setError(null);

      // statblid가 없으면 함수 종료
      if (!statblid) {
        console.log('fetchChartData: statblid가 제공되지 않음');
        return;
      }

      // cardIndex가 없으면 -1로 설정 (기본 차트용)
      if (cardIndex === undefined) {
        cardIndex = -1;
      }

      let stym = '202001';
      let edym = '202509';
      let REG = null

  
      //STATBL_ID=A_2024_00016&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합
      //STATBL_ID=A_2024_00045&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트
      //STATBL_ID=A_2024_00050&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트
      let svcURL = '';
    
      if (statblid === 'A_2024_00016') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statblid +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합';
      } else if (statblid === 'A_2024_00045') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statblid +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트';
      } else if (statblid === 'A_2024_00050') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statblid +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트';
      }
      

      console.log('fetchChartData called with statblid:', statblid);
      console.log('API URL:', svcURL);

      // Next.js 프록시를 통해 API 호출
      const response = await fetch(svcURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API 호출 실패 (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chart data received:', data);
      
      // 새로운 레이어 추가
      setChartLayers(prevLayers => {
        const existingIndex = prevLayers.findIndex(layer => layer.statblid === statblid);
        let newLayers;
        
        if (existingIndex >= 0) {
          // 같은 statblid가 있으면 교체
          newLayers = [...prevLayers];
          newLayers[existingIndex] = { 
            ...data, 
            statblid: statblid
          };
          console.log('Updated existing layer for statblid:', statblid);
        } else {
          // 새로운 레이어 추가
          newLayers = [...prevLayers, { 
            ...data, 
            statblid: statblid
          }];
          console.log('Added new layer for statblid:', statblid);
        }
        
        // 메인 차트 데이터 병합
        const mergedChartData = mergeChartLayers(newLayers);
        setChartData(mergedChartData);
        
        return newLayers;
      });

    } catch (err) {
      console.error('API 호출 오류 상세:', err);
      setError(`연결 오류: ${err.message}. 서버가 실행 중인지 확인해주세요.`);
    }
  };

  // 여러 차트 레이어를 병합하는 함수
  const mergeChartLayers = (layers) => {
    if (!layers || layers.length === 0) return null;
    
    console.log('Merging chart layers:', layers);
    
    const mergedData = {
      data: { datasets: [] },
      labels: [],
      options: {},
      plugins: []
    };
    
    // 모든 레이어의 datasets를 병합
    layers.forEach((layer, index) => {
      if (layer.data && layer.data.datasets) {
        layer.data.datasets.forEach((dataset, datasetIndex) => {
          mergedData.data.datasets.push({
            ...dataset,
            name: `${dataset.name || layer.statblid || 'Dataset'} (${index + 1})`,
            statblid: layer.statblid
          });
        });
      }
      
      // labels 병합 (첫 번째 레이어의 labels 사용)
      if (index === 0 && layer.labels) {
        mergedData.labels = layer.labels;
      }
      
      // options 병합 (첫 번째 레이어의 options 사용)
      if (index === 0 && layer.options) {
        mergedData.options = layer.options;
      }
    });
    
    console.log('Merged chart data:', mergedData);
    return mergedData;
  };

  useEffect(() => {
    // 초기 로딩 시에는 차트 데이터를 로드하지 않음
    // 사용자가 드래그 앤 드롭을 통해 선택한 항목의 차트만 표시
    console.log('Component mounted - waiting for user interaction to load chart data');
  }, []);

  // 차트 레이어 제거 함수
  const removeChartLayer = (statblid, cardIndex) => {
    setChartLayers(prevLayers => {
      const newLayers = prevLayers.filter(layer => layer.statblid !== statblid);
      console.log('Removed layer for statblid:', statblid);
      console.log('Remaining layers:', newLayers);
      
      // 메인 차트 데이터 재병합
      if (newLayers.length > 0) {
        const mergedChartData = mergeChartLayers(newLayers);
        setChartData(mergedChartData);
      } else {
        setChartData(null);
      }
      
      return newLayers;
    });

    // 카드 상태를 초기화 (X버튼을 숨기기 위해)
    if (cardIndex !== undefined) {
      setCards(prevCards => 
        prevCards.map((card, index) => 
          index === cardIndex 
            ? { 
                ...card, 
                title: ['OPT1', 'OPT2', 'OPT3'][cardIndex], 
                figures: '0', 
                statblid: ['OPT1', 'OPT2', 'OPT3'][cardIndex],
                chartType: 'line',
                region: '전국' 
              }
            : card
        )
      );
      console.log(`카드 ${cardIndex + 1} 상태 초기화됨`);
    }
  };

  // AI 질문 처리 함수
  const handleAiQuestion = () => {
    if (!aiQuestion.trim()) return;
    
    console.log('AI 질문:', aiQuestion);
    // TODO: AI API 호출 로직 구현
    // 현재는 콘솔에만 출력
    
    // 질문 전송 후 입력창 초기화
    setAiQuestion('');
  };

  // Enter 키 처리
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAiQuestion();
    }
  };

  // 카드 드롭 처리 - 제목(cName)과 수치(figures) 반영
  const handleDropOnCard = (cardIndex, event) => {
    event.preventDefault();
    let payload = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
    console.log('[handleDropOnCard] payload:', payload);
    if (!payload) return;
    try {
      const obj = JSON.parse(payload);
      console.log('[handleDropOnCard] parsed object:', obj);
      const nextTitle = obj.cname || obj.cContents || 'Untitled';
      // figures가 undefined/null/빈문자열이면 '0'으로 강제
      const nextFigures = (obj.figures !== undefined && obj.figures !== null && String(obj.figures).trim() !== '') ? String(obj.figures) : '0';
      const nextStatblid = obj.statblid || 'Untitled';
      
      // 기존 카드의 statblid 가져오기 (기존 메인차트 레이어 제거용)
      const currentCard = cards[cardIndex];
      const oldStatblid = currentCard.statblid;
      
      // 기존 메인차트 레이어 제거 (OPT1/OPT2/OPT3가 아닌 경우만)
      if (oldStatblid && !['OPT1', 'OPT2', 'OPT3'].includes(oldStatblid)) {
        console.log('[handleDropOnCard] removing old main chart layer for statblid:', oldStatblid);
        setChartLayers(prevLayers => {
          const filteredLayers = prevLayers.filter(layer => 
            !(layer.statblid === oldStatblid && layer.cardIndex === undefined)
          );
          return filteredLayers;
        });
      }
      
      setCards((prev) => {
        const updated = prev.map((c, i) => (i === cardIndex ? { ...c, title: nextTitle, figures: nextFigures , statblid: nextStatblid, region: c.region } : c));
        console.log('[handleDropOnCard] updated cards:', updated);
        return updated;
      });
      
      // statblid가 있으면 fetchChartData를 호출해서 실제 차트 데이터를 가져옴
      if (obj.statblid) {
        console.log('[handleDropOnCard] calling fetchChartData with statblid:', obj.statblid, 'cardIndex:', cardIndex);
        fetchChartData(obj.statblid, cardIndex);
      }
      
    } catch (err) {
      console.error('[handleDropOnCard] JSON parse error:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '90vh', ml: '-8px', width: 'calc(100% + 8px)' }}>
      <Box sx={{ width: '75%', overflow: 'auto', height: '90vh' }}>
        {/* 조회 년도 범위 (사용자 조정 가능) */}
        <Box sx={{ p: 0, pb: 1 }}>
          <Grid container alignItems="center" justifyContent="flex-start" sx={{ m: 0 }}>
            <Grid sx={{ pl: 0, ml: 0 }}>
              <Typography variant="h5" sx={{ pl: 0, ml: 0 }}>조회 년도 범위
                <Typography variant="caption" color="text.secondary">{
                  (() => {
                    const y = SLIDER_START_YEAR + Math.floor(yearRange[0] / 12);
                    const m = (yearRange[0] % 12) + 1;
                    return ` [ ${y}년${String(m).padStart(2,'0')}월`;
                  })()
                }</Typography>
                <Typography variant="caption" color="text.secondary">{
                  (() => {
                    const y = SLIDER_START_YEAR + Math.floor(yearRange[1] / 12);
                    const m = (yearRange[1] % 12) + 1;
                    return `~ ${y}년${String(m).padStart(2,'0')}월 ]`;
                  })()
                }</Typography>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '90%', justifyContent: 'center', margin: '0 auto' }}>
            <Slider
              value={yearRange}
              min={0}
              max={monthCount - 1}
              step={1}
              valueLabelDisplay="auto"
              sx={{ flex: 1, height: 8,
                '& .MuiSlider-thumb': { width: 24, height: 24 },
                '& .MuiSlider-track': { height: 8 },
                '& .MuiSlider-rail': { height: 8 },
                mt: 2, mb: 2
              }}
              onChange={(e, newValue) => setYearRange(newValue)}
              marks={(() => {
                const marks = [];
                for(let i=0; i<monthCount; i++) {
                    const year = SLIDER_START_YEAR + Math.floor(i/12);
                  const month = (i%12)+1;
                  if(month === 1 || i === monthCount-1) {
                    marks.push({ value: i, label: `${year}.${String(month).padStart(2,'0')}` });
                  }
                }
                return marks;
              })()}
              getAriaValueText={v => {
                const year = SLIDER_START_YEAR + Math.floor(v/12);
                const month = (v%12)+1;
                return `${year}년${String(month).padStart(2,'0')}월`;
              }}
              valueLabelFormat={v => {
                const year = SLIDER_START_YEAR + Math.floor(v/12);
                const month = (v%12)+1;
                return `${year}년${String(month).padStart(2,'0')}월`;
              }}
            />
            
          </Box>
        </Box>
        <Grid container rowSpacing={4.5} columnSpacing={3} sx={{ p: 2, pt: 0 }}>
          {/* row 1 - 3 AnalyticsDataCard wrapped in a centered Grid */}
          <Grid sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={3} sx={{ width: '100%', justifyContent: 'center', alignItems: 'stretch', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Grid sx={{ display: 'flex', minWidth: 0, alignItems: 'stretch' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(0, e)}>
                <AnalyticsDataCard 
                  key={cards[0].title + cards[0].figures + cards[0].statblid}
                  title={cards[0].title} 
                  figures={cards[0].figures} 
                  statblid={cards[0].statblid}
                  isActiveInChart={cards[0].statblid !== 'OPT1'}
                  onRemoveFromChart={() => removeChartLayer(cards[0].statblid, 0)}
                  onResetCard={handleResetCard}
                  region={cards[0].region}
                  onRegionChange={(newRegion) => handleCardRegionChange(0, newRegion)}
                  regionOptions={regionOptions}
                  chartData={getCardChartData(cards[0].statblid, 0)}
                  cardIndex={0}
                  chartColor={cards[0].color}
                  chartType={cards[0].chartType}
                  sx={{ flex: 1, minHeight: 260, display: 'flex', flexDirection: 'column' }}
                >
                  <UsersCardChart />
                </AnalyticsDataCard>
              </Grid>
              <Grid sx={{ display: 'flex' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(1, e)}>
                <AnalyticsDataCard 
                  key={cards[1].title + cards[1].figures + cards[1].statblid}
                  title={cards[1].title} 
                  figures={cards[1].figures} 
                  statblid={cards[1].statblid}
                  isActiveInChart={cards[1].statblid !== 'OPT2'}
                  onRemoveFromChart={() => removeChartLayer(cards[1].statblid, 1)}
                  onResetCard={handleResetCard}
                  region={cards[1].region}
                  onRegionChange={(newRegion) => handleCardRegionChange(1, newRegion)}
                  regionOptions={regionOptions}
                  chartData={getCardChartData(cards[1].statblid, 1)}
                  cardIndex={1}
                  chartColor={cards[1].color}
                  chartType={cards[1].chartType}
                  sx={{ flex: 1, minHeight: 260, display: 'flex', flexDirection: 'column' }}
                >
                  <UsersCardChart />
                </AnalyticsDataCard>
              </Grid>
              <Grid sx={{ display: 'flex' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(2, e)}>
                <AnalyticsDataCard 
                  key={cards[2].title + cards[2].figures + cards[2].statblid}
                  title={cards[2].title} 
                  figures={cards[2].figures} 
                  statblid={cards[2].statblid}
                  isActiveInChart={cards[2].statblid !== 'OPT3'}
                  onRemoveFromChart={() => removeChartLayer(cards[2].statblid, 2)}
                  onResetCard={handleResetCard}
                  region={cards[2].region}
                  onRegionChange={(newRegion) => handleCardRegionChange(2, newRegion)}
                  regionOptions={regionOptions}
                  chartData={getCardChartData(cards[2].statblid, 2)}
                  cardIndex={2}
                  chartColor={cards[2].color}
                  chartType={cards[2].chartType}
                  sx={{ flex: 1, minHeight: 260, display: 'flex', flexDirection: 'column' }}
                >
                  <UsersCardChart />
                </AnalyticsDataCard>
              </Grid>
            </Grid>
          </Grid>
          {/* row 2 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }} sx={{ mt: 1 }}>
            <Grid container alignItems="center" justifyContent="space-between">
                <Typography variant="h5">그래프</Typography>
            </Grid>
            {/* 그래프 - 상대 위치로 설정하여 오버레이 가능하게 */}
            <Box sx={{ position: 'relative' }}>
              {/* fetchChartData 결과 전달 */}
              {chartData ? (
                <ApexMixedChart 
                  chartData={chartData} 
                  chartColors={cardColors}
                  colorMapping={cards.reduce((map, card, index) => {
                    map[card.statblid] = card.color;
                    return map;
                  }, {})}
                  chartTypeMapping={cards.reduce((map, card, index) => {
                    map[card.statblid] = card.chartType;
                    return map;
                  }, {})}
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 400,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body1" color="text.secondary">
                    트리에서 항목을 드래그해서 카드에 드롭하면 해당 차트가 표시됩니다
                  </Typography>
                </Box>
              )}

              {/* 정책자료 오버레이 */}
              {showPolicyOverlay && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 100, // 버튼 영역을 확실히 가리지 않도록 설정
                    backgroundColor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    zIndex: 1000, // 높은 z-index로 그래프 위에 표시
                    overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* 오버레이 헤더 */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                        정책자료 데이터
                      </Typography>
                      <button
                        onClick={() => setShowPolicyOverlay(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          color: 'white'
                        }}
                      >
                        ×
                      </button>
                    </Box>

                    {/* 데이터 테이블 */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>선택</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>날짜</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>제목</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250627</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.06.27) 가계부채 관리 강화 방안<br/>
                              <small style={{ color: '#666' }}>
                                LTV 등 규제 강화 / 가계대출 총량관리 강화 / 은행의 자율관리책자 추출 / 주요권으로 혹내 시행 / 추가대상명칭 추진선별 적용
                              </small>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250529</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.05.29) 금융 · 통화<br/>
                              <small style={{ color: '#666' }}>
                                한국은행 기준금리 인하
                              </small>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250521</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.05.21) 가계부채 관리화<br/>
                              <small style={{ color: '#666' }}>
                                3단계 스트레스 DSR 시행('25.7.1~)
                              </small>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250520</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.05.20) 가계대출규제 · DSR<br/>
                              <small style={{ color: '#666' }}>
                                3단계 스트레스 DSR 시행
                              </small>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250520</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.05.20) 전세시기 비례 지원<br/>
                              <small style={{ color: '#666' }}>
                                전세시기대체 지원 및 주기업집에 관한 특별법 일부개정
                              </small>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>20250319</td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              (25.03.19) 주택시장 안정화 방안<br/>
                              <small style={{ color: '#666' }}>
                                금융 · 가계대출 관리 강화 / 주거안정지역 · 부가처별지구 지정 긴드 / 주택공급 기간 강화 / 주택시장 거래질서 확립 / 주저기업 기간 강화 / 주택시장 거래질서기등
                              </small>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                </Box>
              )}
            </Box>

            {/* 차트 하단 버튼들 */}
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              justifyContent: 'flex-start', // 왼쪽 정렬로 변경
              gap: 1.0 // 간격 조금 줄임
            }}>
              <button 
                onClick={() => {
                  // 정책자료 오버레이 토글
                  console.log('정책자료 버튼 클릭, 현재 상태:', showPolicyOverlay);
                  setShowPolicyOverlay(!showPolicyOverlay);
                  console.log('정책자료 상태 변경:', !showPolicyOverlay);
                }}
                style={{
                  padding: '6px 16px', // 패딩 줄임
                  backgroundColor: showPolicyOverlay ? '#5a6268' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px', // 폰트 크기 줄임
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = showPolicyOverlay ? '#5a6268' : '#6c757d'}
              >
                정책자료
              </button>
              
              <button 
                onClick={() => {
                  // 모든 카드 리셋
                  [0, 1, 2].forEach(cardIndex => {
                    handleResetCard(cardIndex);
                  });
                  // 차트 초기화 기능
                  setChartLayers([]);
                  setChartData(null);
                  console.log('차트 초기화 및 모든 카드 리셋 완료');
                }}
                style={{
                  padding: '6px 16px', // 패딩 줄임
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px', // 폰트 크기 줄임
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                차트 초기화
              </button>
              
              <button 
                onClick={() => {
                  // AI 분석 기능
                  console.log('AI 분석 클릭');
                  // TODO: AI 분석 모달이나 기능 구현
                }}
                style={{
                  padding: '6px 16px', // 패딩 줄임
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px', // 폰트 크기 줄임
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                AI 분석
              </button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 우측 AI 컴포넌트 영역 */}
      <Box 
        sx={{ 
          width: '28%', 
          height: '90vh', 
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            AI 분석 도구
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            AI 컴포넌트가 여기에 추가될 예정입니다.
          </Typography>
          
          {/* TODO: AI 컴포넌트 추가 영역 */}
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'divider', 
            borderRadius: 2,
            textAlign: 'center',
            flex: 1,
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body1" color="text.secondary">
              AI 분석 도구
            </Typography>
          </Box>

          {/* AI 질문 입력창 */}
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            gap: 1.5,
            alignItems: 'flex-end'
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              variant="outlined"
              placeholder="AI에게 질문하세요..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '14px'
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleAiQuestion}
              disabled={!aiQuestion.trim()}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}