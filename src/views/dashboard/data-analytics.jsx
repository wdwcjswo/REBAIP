'use client';

import dynamic from 'next/dynamic';

// material-ui
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// MUI X Tree View
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

// react
import { useState, useEffect, useMemo } from 'react';

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
  const [menuData, setMenuData] = useState(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState(null);
  const [showPolicyOverlay, setShowPolicyOverlay] = useState(false); // 정책자료 오버레이 상태
  const [cards, setCards] = useState([
    { title: 't1', count: '0', statblid: 'test1', region: '전국' },
    { title: 't2', count: '0', statblid: 'test2', region: '전국' },
    { title: 't3', count: '0', statblid: 'test3', region: '전국' }
  ]);
  const [chartData, setChartData] = useState(null); // 초기에는 null로 설정
  const [chartLayers, setChartLayers] = useState([]); // 차트 레이어들을 누적 저장
  const [aiQuestion, setAiQuestion] = useState(''); // AI 질문 입력
  const [selectedRegion, setSelectedRegion] = useState('전국'); // 지역 선택 상태

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
  

  //  const server = "http://172.16.10.56:8087/RAP";
  const server = "http://127.0.0.1:8087/RAP";

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoadingMenu(true);
        setError(null);

        // Next.js 프록시를 통해 API 호출
        const response = await fetch('/api/rap/getMenuJSON', {
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
        console.log('setMenuData, loaded', data?.length || 0, 'items');
        setMenuData(data);

      } catch (err) {
        console.error('API 호출 오류 상세:', err);
        setError(`연결 오류: ${err.message}. 서버가 실행 중인지 확인해주세요.`);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuData();
  }, []);

  // fetchChartData 함수를 독립적으로 분리
  const fetchChartData = async (statbleId) => {
    try {
      setError(null);

      // statbleId가 없으면 함수 종료
      if (!statbleId) {
        console.log('fetchChartData: statbleId가 제공되지 않음');
        return;
      }

      let stym = '202001';
      let edym = '202509';
      let REG = null

  
      //STATBL_ID=A_2024_00016&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합
      //STATBL_ID=A_2024_00045&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트
      //STATBL_ID=A_2024_00050&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트
      let svcURL = '';
    
      if (statbleId === 'A_2024_00016') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statbleId +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합';
      } else if (statbleId === 'A_2024_00045') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statbleId +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트';
      } else if (statbleId === 'A_2024_00050') {
        svcURL = "/api/rap/getChart_RONE_OPT" +'?STATBL_ID='+statbleId +'&ST_YM='+202001+'&ED_YM='+202509+'&GRP_ID='+REG+'&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트';
      }
      

      console.log('fetchChartData called with statbleId:', statbleId);
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
      
      // 새로운 레이어 추가 (같은 statblid가 있으면 교체, 없으면 추가)
      setChartLayers(prevLayers => {
        const existingIndex = prevLayers.findIndex(layer => layer.statblid === statbleId);
        let newLayers;
        
        if (existingIndex >= 0) {
          // 같은 statblid가 있으면 교체
          newLayers = [...prevLayers];
          newLayers[existingIndex] = { ...data, statblid: statbleId };
          console.log('Updated existing layer for statblid:', statbleId);
        } else {
          // 새로운 레이어 추가
          newLayers = [...prevLayers, { ...data, statblid: statbleId }];
          console.log('Added new layer for statblid:', statbleId);
        }
        
        // 차트 데이터 병합
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
            statblid: layer.statblid // statblid 정보 보존
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

  // 드래그 시작 - Tree 항목 JSON 전달
  const onDragStart = (event, item) => {
    try {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    } catch {}
  };

  // 차트 레이어 제거 함수
  const removeChartLayer = (statblid) => {
    setChartLayers(prevLayers => {
      const newLayers = prevLayers.filter(layer => layer.statblid !== statblid);
      console.log('Removed layer for statblid:', statblid);
      console.log('Remaining layers:', newLayers);
      
      // 차트 데이터 재병합
      if (newLayers.length > 0) {
        const mergedChartData = mergeChartLayers(newLayers);
        setChartData(mergedChartData);
      } else {
        setChartData(null);
      }
      
      return newLayers;
    });
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

  // 카드 드롭 처리 - 제목(cName)과 count 반영
  const handleDropOnCard = (cardIndex, event) => {
    event.preventDefault();
    let payload = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
    console.log('[handleDropOnCard] payload:', payload);
    if (!payload) return;
    try {
      const obj = JSON.parse(payload);
      console.log('[handleDropOnCard] parsed object:', obj);
      const nextTitle = obj.cname || obj.cContents || 'Untitled';
      const nextCount = obj.count ? String(obj.count) : '';
      const nextStatblid = obj.statblid || 'Untitled';
      
      setCards((prev) => {
        const updated = prev.map((c, i) => (i === cardIndex ? { ...c, title: nextTitle, count: nextCount , statblid: nextStatblid, region: c.region } : c));
        console.log('[handleDropOnCard] updated cards:', updated);
        return updated;
      });
      
      // statblid가 있으면 fetchChartData를 호출해서 실제 차트 데이터를 가져옴
      if (obj.statblid) {
        console.log('[handleDropOnCard] calling fetchChartData with statblid:', obj.statblid);
        fetchChartData(obj.statblid);
      }
      
    } catch (err) {
      console.error('[handleDropOnCard] JSON parse error:', err);
    }
  };

  // JSON 데이터를 Tree View 형식으로 변환 (중복 제거) - 메모이제이션 적용
  const convertToTreeItems = useMemo(() => (items, parentId = '') => {
    return items.map((item, index) => {
      const itemId = parentId ? `${parentId}-${index}` : `item-${index}`;
      const labelNode = (
        <Box
          draggable
          onDragStart={(e) => onDragStart(e, item)}
          sx={{ cursor: 'grab', width: '100%', textAlign: 'left' }}
        >
          {item.cContents || 'Untitled'}
        </Box>
      );

      return (
        <TreeItem key={itemId} itemId={itemId} label={labelNode}>
          {item.children && item.children.length > 0 && convertToTreeItems(item.children, itemId)}
        </TreeItem>
      );
    });
  }, []);

    // 중복 데이터 필터링 함수 - 개선된 버전 - 메모이제이션 적용
    const filterDuplicateItems = useMemo(() => (items) => {
    const filteredItems = [];
    const seenItems = new Set();
    
    // 먼저 모든 하위 항목의 이름을 수집
    const childNames = new Set();
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          childNames.add(child.cContents);
        });
      }
    });
    
    // 상위 항목만 필터링 (하위 항목으로도 존재하지 않는 항목들)
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        // 상위 항목이고 중복되지 않은 경우
        if (!seenItems.has(item.cContents)) {
          seenItems.add(item.cContents);
          filteredItems.push(item);
        }
      } else if (!childNames.has(item.cContents)) {
        // 하위 항목이 아니고 중복되지 않은 독립 항목
        if (!seenItems.has(item.cContents)) {
          seenItems.add(item.cContents);
          filteredItems.push(item);
        }
      }
    });
    
    return filteredItems;
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '85vh', ml: '-8px', width: 'calc(100% + 8px)' }}>
      {/* 좌측 사이드바 - Tree View */}
      <Box 
        sx={{ 
          width: 'calc(15% + 8px)', 
          height: '85vh', 
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            테스트 통계 메뉴
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loadingMenu && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  API 연결 실패
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  가능한 해결 방법:
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  1. http://localhost:8087 서버가 실행 중인지 확인
                </Typography>
                <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                  2. 브라우저 개발자 도구의 Network 탭에서 상세 오류 확인
                </Typography>
                <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                  3. CORS 설정이 올바른지 확인
                </Typography>
              </Alert>
            </Box>
          )}
          
          {!loadingMenu && !menuData && !error && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">메뉴 데이터가 없습니다.</Typography>
            </Box>
          )}
          
          {menuData && (
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 0,
              height: 'calc(75vh - 48px)' // 85vh 기준으로 조정
            }}>
            <SimpleTreeView
              defaultExpandedItems={['item-0']} // 첫 번째 항목을 기본으로 확장
              sx={{
                width: '100%',
                height: '100%', // 부모 컨테이너의 전체 높이 사용
                overflow: 'auto',
                '& .MuiTreeItem-root': {
                  width: '100%',
                },
                '& .MuiTreeItem-content': {
                  width: '100%',
                  padding: '4px 6px',
                  borderRadius: '0px',
                  margin: '0',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.lighter',
                    '&:hover': {
                      backgroundColor: 'primary.lighter',
                    },
                  },
                },
                '& .MuiTreeItem-label': {
                  fontSize: '12px',
                  fontWeight: 500,
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  lineHeight: 1.2,
                },
                '& .MuiTreeItem-group': {
                  marginLeft: '8px',
                  width: 'calc(100% - 8px)',
                  '& .MuiTreeItem-content': {
                    paddingLeft: '12px',
                    backgroundColor: 'background.default',
                  },
                },
                '& .MuiTreeItem-iconContainer': {
                  marginRight: '4px',
                  flexShrink: 0,
                  width: '14px',
                  height: '14px',
                },
              }}
            >
              {convertToTreeItems(filterDuplicateItems(menuData))}
            </SimpleTreeView>
            </Box>
          )}
        </Box>
      </Box>

      {/* 중앙 메인 콘텐츠 - 차트 및 카드 */}
      <Box sx={{ width: '65%', overflow: 'auto', height: '85vh' }}>
        <Grid container rowSpacing={4.5} columnSpacing={3} sx={{ p: 2 }}>
          {/* row 1 */}
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(0, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard 
              key={cards[0].title + cards[0].count + cards[0].statblid}
              title={cards[0].title} 
              count={cards[0].count} 
              statblid={cards[0].statblid}
              isActiveInChart={chartLayers.some(layer => layer.statblid === cards[0].statblid)}
              onRemoveFromChart={() => removeChartLayer(cards[0].statblid)}
              region={cards[0].region}
              onRegionChange={(newRegion) => handleCardRegionChange(0, newRegion)}
              regionOptions={regionOptions}
            >
              <UsersCardChart />
            </AnalyticsDataCard>
          </Grid>
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(1, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard 
              key={cards[1].title + cards[1].count + cards[1].statblid}
              title={cards[1].title} 
              count={cards[1].count} 
              statblid={cards[1].statblid}
              isActiveInChart={chartLayers.some(layer => layer.statblid === cards[1].statblid)}
              onRemoveFromChart={() => removeChartLayer(cards[1].statblid)}
              region={cards[1].region}
              onRegionChange={(newRegion) => handleCardRegionChange(1, newRegion)}
              regionOptions={regionOptions}
            >
              <UsersCardChart />
            </AnalyticsDataCard>
          </Grid>          
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(2, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard 
              key={cards[2].title + cards[2].count + cards[2].statblid}
              title={cards[2].title} 
              count={cards[2].count} 
              statblid={cards[2].statblid}
              isActiveInChart={chartLayers.some(layer => layer.statblid === cards[2].statblid)}
              onRemoveFromChart={() => removeChartLayer(cards[2].statblid)}
              region={cards[2].region}
              onRegionChange={(newRegion) => handleCardRegionChange(2, newRegion)}
              regionOptions={regionOptions}
            >
              <UsersCardChart />
            </AnalyticsDataCard>
          </Grid>
          <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
          {/* row 2 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">그래프</Typography>
                {chartLayers.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    활성 레이어: {chartLayers.map(layer => layer.statblid).join(', ')} (총 {chartLayers.length}개)
                  </Typography>
                )}
              </Grid>
              {chartLayers.length > 0 && (
                <Grid>
                  <button 
                    onClick={() => {
                      setChartLayers([]);
                      setChartData(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    모든 레이어 삭제
                  </button>
                </Grid>
              )}
            </Grid>
            {/* 그래프 - 상대 위치로 설정하여 오버레이 가능하게 */}
            <Box sx={{ position: 'relative' }}>
              {/* ApexCharts로 변경된 그래프 - fetchChartData 결과를 전달 */}
              {chartData ? (
                <ApexMixedChart chartData={chartData} />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 450,
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
              justifyContent: 'center', 
              gap: 2 
            }}>
              <button 
                onClick={() => {
                  // 정책자료 오버레이 토글
                  console.log('정책자료 버튼 클릭, 현재 상태:', showPolicyOverlay);
                  setShowPolicyOverlay(!showPolicyOverlay);
                  console.log('정책자료 상태 변경:', !showPolicyOverlay);
                }}
                style={{
                  padding: '8px 20px',
                  backgroundColor: showPolicyOverlay ? '#5a6268' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = showPolicyOverlay ? '#5a6268' : '#6c757d'}
              >
                정책자료
              </button>
              
              <button 
                onClick={() => {
                  // 차트 초기화 기능
                  setChartLayers([]);
                  setChartData(null);
                  console.log('차트 초기화 클릭');
                }}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                  padding: '8px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
          width: '20%', 
          height: '85vh', 
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            AI 분석 도구
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            AI 컴포넌트가 여기에 추가될 예정입니다.
          </Typography>
          
          {/* TODO: AI 컴포넌트 추가 영역 */}
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            border: '1px dashed', 
            borderColor: 'divider', 
            borderRadius: 1,
            textAlign: 'center',
            flex: 1
          }}>
            <Typography variant="caption" color="text.secondary">
              AI 분석 도구
            </Typography>
          </Box>

          {/* AI 질문 입력창 */}
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            gap: 1,
            alignItems: 'flex-end'
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              variant="outlined"
              placeholder="AI에게 질문하세요..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
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