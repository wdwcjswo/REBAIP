'use client';

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

// MUI X Tree View
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

// react
import { useState, useEffect } from 'react';

// project imports
import MainCard from 'components/MainCard';
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';

import MarketingCardChart from 'sections/dashboard/analytics/MarketingCardChart';
import OrdersCardChart from 'sections/dashboard/analytics/OrdersCardChart';
import OrdersList from 'sections/dashboard/analytics/OrdersList';
import PageViews from 'sections/dashboard/analytics/PageViews';
import ReportChart from 'sections/dashboard/analytics/ReportChart';
import SalesCardChart from 'sections/dashboard/analytics/SalesCardChart';
import TransactionHistory from 'sections/dashboard/analytics/TransactionHistory';
import UsersCardChart from 'sections/dashboard/analytics/UsersCardChart';
import LabelledTasks from 'sections/dashboard/analytics/LabelledTasks';
import ReaderCard from 'sections/dashboard/analytics/ReaderCard';
import AcquisitionChannels from 'sections/dashboard/analytics/AcquisitionChannels';

// assets
import IncomeOverviewCard from 'sections/dashboard/analytics/IncomeOverviewCard';
import SaleReportCard from 'sections/dashboard/analytics/SaleReportCard';

// ==============================|| DASHBOARD - DATA ANALYTICS ||============================== //

export default function DashboardDataAnalytics() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([
    { title: 'Total Users', count: '78,250' },
    { title: 'Total Order', count: '18,800' },
    { title: 'Total Marketing', count: '$1,12,083' }
  ]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
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
        console.log('API Response data:', data);
        setMenuData(data);

      } catch (err) {
        console.error('API 호출 오류 상세:', err);
        setError(`연결 오류: ${err.message}. 서버가 실행 중인지 확인해주세요.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // 드래그 시작 - Tree 항목 JSON 전달
  const onDragStart = (event, item) => {
    try {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    } catch {}
  };

  // 카드 드롭 처리 - 제목(cName)과 count 반영
  const handleDropOnCard = (cardIndex, event) => {
    event.preventDefault();
    let payload = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
    if (!payload) return;
    try {
      const obj = JSON.parse(payload);
      const nextTitle = obj.cname || obj.cName || obj.cContents || 'Untitled';
      const nextCount = obj.count ? String(obj.count) : '';
      setCards((prev) => prev.map((c, i) => (i === cardIndex ? { ...c, title: nextTitle, count: nextCount } : c)));
    } catch {}
  };

  // JSON 데이터를 Tree View 형식으로 변환 (중복 제거)
  const convertToTreeItems = (items, parentId = '') => {
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
  };

  // 중복 데이터 필터링 함수 - 개선된 버전
  const filterDuplicateItems = (items) => {
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
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', ml: '-8px', width: 'calc(100% + 8px)' }}>
      {/* 좌측 사이드바 - Tree View */}
      <Box 
        sx={{ 
          width: 'calc(27% + 8px)', 
          height: '100vh', 
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            통계 메뉴
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {loading && (
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
          
          {menuData && (
            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            <SimpleTreeView
              defaultExpandedItems={['item-0']} // 첫 번째 항목을 기본으로 확장
              sx={{
                width: '100%',
                height: '50%',
                '& .MuiTreeItem-root': {
                  width: '100%',
                },
                '& .MuiTreeItem-content': {
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '0px',
                  margin: '0',
                  minHeight: '36px',
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
                  fontSize: '13px',
                  fontWeight: 500,
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  lineHeight: 1.2,
                },
                '& .MuiTreeItem-group': {
                  marginLeft: '12px',
                  width: 'calc(100% - 12px)',
                  '& .MuiTreeItem-content': {
                    paddingLeft: '16px',
                    backgroundColor: 'background.default',
                  },
                },
                '& .MuiTreeItem-iconContainer': {
                  marginRight: '6px',
                  flexShrink: 0,
                  width: '16px',
                  height: '16px',
                },
              }}
            >
              {convertToTreeItems(filterDuplicateItems(menuData))}
            </SimpleTreeView>
            </Box>
          )}
        </Box>
      </Box>

      {/* 우측 메인 콘텐츠 */}
      <Box sx={{ width: '73%', overflow: 'auto', height: '100vh' }}>
        <Grid container rowSpacing={4.5} columnSpacing={3} sx={{ p: 2 }}>
          {/* row 1 */}
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(0, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard title={cards[0].title} count={cards[0].count} percentage={70.5}>
              <UsersCardChart />
            </AnalyticsDataCard>
          </Grid>
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(1, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard title={cards[1].title} count={cards[1].count} percentage={27.4} isLoss color="warning">
              <OrdersCardChart />
            </AnalyticsDataCard>
          </Grid>          
          <Grid onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnCard(2, e)} size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AnalyticsDataCard title={cards[2].title} count={cards[2].count} percentage={70.5}>
              <MarketingCardChart />
            </AnalyticsDataCard>
          </Grid>
          <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
          {/* row 2 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Income Overview</Typography>
              </Grid>
            </Grid>
            <IncomeOverviewCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}