import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import useSWR, { mutate } from 'swr';
import { useMemo, useState, useEffect } from 'react';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';


// Project-imports
import { fetcher } from 'utils/axios';

export const icons = { loading: LoadingOutlined, dashboard: DashboardOutlined, components: GoldOutlined };

const initialState = {
  openedItem: null,
  openedComponent: 'buttons',
  openedHorizontalItem: null,
  isDashboardDrawerOpened: true,
  isComponentDrawerOpened: true
};

const endpoints = {
  key: 'api/menu',
  master: 'master',
  dashboard: '/dashboard' // server URL
};

const apartmentInfoMenuItem = {
  id: 'info-apartment',
  title: '아파트 정보',
  type: 'item',
  icon: 'components',
  url: '/dashboard/info-apartment'
};

export function useGetMenu() {
  const [dynamicDataAnalyticsMenuItem, setDynamicDataAnalyticsMenuItem] = useState(null);
  const [dynamicMenuLoading, setDynamicMenuLoading] = useState(true);
  const [dynamicMenuError, setDynamicMenuError] = useState(null);

  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.dashboard, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // 동적 메뉴 로딩 - RESTSERVER API 호출 
  useEffect(() => {
    const loadDynamicMenu = async () => {
      try {
        setDynamicMenuLoading(true);
        setDynamicMenuError(null);
        
        // API에서 메뉴 데이터 가져오기
        const apiData = await fetchMenuData();

        // 상세 로그 출력
        //console.log('API에서 메뉴 데이터 전체:', apiData);
        console.log('API에서 메뉴 데이터 가져오기:', apiData?.length || 0, '개 항목');

        // API 데이터로 메뉴 아이템 생성
        const dynamicMenu = convertApiDataToMenuItem(apiData);
 
        setDynamicDataAnalyticsMenuItem(dynamicMenu);
      } catch (err) {
        console.error('동적 메뉴 로딩 실패:', err);
        setDynamicMenuError(err);
      } finally {
        setDynamicMenuLoading(false);
      }
    };

    loadDynamicMenu();
  }, []);

  const memoizedValue = useMemo(() => {
    let updatedMenu = data?.dashboard;

    if (updatedMenu && Array.isArray(updatedMenu.children) && updatedMenu.children.length > 0 && dynamicDataAnalyticsMenuItem) {
      // 최상위에서 'ai 데이터 분석'만 남기고 모두 삭제
      const filteredGroups = updatedMenu.children.filter(group => {
        const title = (group.title || '').trim().toLowerCase();
        return title !== 'components' && 
              title !== 'default' && 
              title !== 'analytics';
      });
      updatedMenu = {
        ...updatedMenu,
        children: filteredGroups.map((group) => {
          if (Array.isArray(group.children)) {
            // 동적 메뉴
            return {
              ...group,
              children: [dynamicDataAnalyticsMenuItem, apartmentInfoMenuItem]
            };
          }
          return group;
        })
      };
    }

    return {
      menu: updatedMenu,
      menuLoading: isLoading || dynamicMenuLoading,
      menuError: error || dynamicMenuError,
      menuValidating: isValidating,
      menuEmpty: !isLoading && !data?.length
    };
  }, [data, error, isLoading, isValidating, dynamicDataAnalyticsMenuItem, dynamicMenuLoading, dynamicMenuError]);

  // 오류 발생 시 Alert 컴포넌트 반환
  if (memoizedValue.menuError) {
    return {
      ...memoizedValue,
      errorComponent: (
        <Alert severity="error" sx={{ mt: 2 }}>
          {memoizedValue.menuError.message || String(memoizedValue.menuError)}
        </Alert>
      )
    };
  }
  return memoizedValue;
}

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerComponentDrawer(isComponentDrawerOpened) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isComponentDrawerOpened };
    },
    false
  );
}

export function handlerActiveComponent(openedComponent) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, openedComponent };
    },
    false
  );
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}

export function handlerHorizontalActiveItem(openedHorizontalItem) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, openedHorizontalItem };
    },
    false
  );
}

export function handlerActiveItem(openedItem) {
  mutate(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      return { ...currentMenuMaster, openedItem };
    },
    false
  );
}

// 메뉴 데이터를 가져오는 함수
export const fetchMenuData = async () => {
  try {
    const response = await fetch('/api/rap/getMenuJSON', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (err) {
    console.error('API 호출 오류:', err);
    throw new Error(`연결 오류: ${err.message}`);
  }
};

// 드래그 시작 핸들러
export const onDragStart = (event, item) => {
  try {
    if (!item) return;

    const dragData = {
      id: item.id || 'unknown',
      cname: item.cContents || item.title || 'Untitled',
      cContents: item.cContents || item.title || 'Untitled',
      statblid: item.cCode || item.statblid || 'unknown',
      url: item.url || '',
      newdate: item.newdate || '000000',
      figures: item.figures || '0',
      ctype: item.ctype || ''
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
  } catch (error) {
    console.error('드래그 데이터 설정 오류:', error);
    throw new Error(`드래그 데이터 설정 오류: ${err.message}`);
  }
};

// JSON 데이터를 Tree View 형식으로 변환 (계층적 구조 지원)
export const convertToTreeItems = (items, parentId = '', level = 0) => {
  return items.map((item, index) => {
    const itemId = parentId ? `${parentId}-${index}` : `item-${index}`;
    const isParentNode = item.children && Array.isArray(item.children) && item.children.length > 0;
    const isLeafNode = !isParentNode;
    
    // 드래그 가능한 노드는 실제 데이터가 있는 리프 노드만
    const isDraggable = isLeafNode && (item.statblid || item.cCode);
    console.log('isDraggable:', isDraggable, 'item:', item);
    
    // 아이콘 컴포넌트 렌더링 (item.icon이 있으면 실제 아이콘, 없으면 이모지 fallback)
    let iconNode = null;
    let IconComponent = item.icon;
    // 아이콘이 없거나 문자열(아이콘 이름)일 경우 기본 아이콘으로 대체
    if (!IconComponent || typeof IconComponent === 'string') {
      IconComponent = ArrowRightIcon;
    }
    if (IconComponent) {
      iconNode = <IconComponent style={{ fontSize: 16, color: isParentNode ? '#1976d2' : '#9c27b0', marginRight: 4 }} />;
    }

    const labelNode = (
      <Box
        draggable={isDraggable}
        onDragStart={isDraggable ? (e) => {
          // 드래그할 때 사용할 완전한 데이터 객체 구성
          const dragItem = {
            ...rest,
            id: item.id || itemId,
            cname: item.cname || item.title || 'Untitled',
            cContents: item.cContents || item.cname || item.title || 'Untitled',
            statblid: item.statblid || item.cCode || 'unknown',
            figures: item.figures || '0', // 실제 figures 또는 기본값 '0'
            url: item.url || ''
          };
          onDragStart(e, dragItem);
        } : undefined}
        sx={{ 
          cursor: isDraggable ? 'grab' : 'default', 
          width: '100%', 
          textAlign: 'left',
          fontWeight: isParentNode ? 600 : 400,
          fontSize: isParentNode ? '13px' : '12px',
          color: isParentNode ? 'primary.main' : 'text.primary',
          padding: '2px 4px',
          borderRadius: '4px',
          '&:hover': isDraggable ? {
            backgroundColor: 'action.hover',
          } : {},
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {/* 아이콘 표시 */}
        {iconNode}

        {/* 제목 */}
        <Box component="span" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ fontWeight: isParentNode ? 600 : 500 }}>
            {item.cContents || item.cname || 'Untitled'}
          </Box>
          {/* 리프 노드에서 statblid가 있는 경우 추가 정보 표시 */}
          {isLeafNode && item.statblid && (
            <Box 
              sx={{ 
                fontSize: '10px', 
                color: 'text.secondary',
                fontFamily: 'monospace',
                opacity: 0.7
              }}
            >
              ID: {item.statblid}
            </Box>
          )}
        </Box>

        {/* 데이터 개수 표시 (리프 노드에만) */}
        {isLeafNode && item.figures && (
          <Box 
            component="span" 
            sx={{ 
              fontSize: '10px', 
              color: 'text.secondary',
              backgroundColor: 'grey.100',
              padding: '1px 4px',
              borderRadius: '8px',
              minWidth: '20px',
              textAlign: 'center'
            }}
          >
            {item.figures}
          </Box>
        )}
      </Box>
    );

    return (
      <TreeItem key={itemId} itemId={itemId} label={labelNode}>
        {isParentNode && convertToTreeItems(item.children, itemId, level + 1)}
      </TreeItem>
    );
  });
};


// API 데이터를 메뉴 아이템 구조로 변환 (계층적 구조 지원)
export const convertApiDataToMenuItem = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return null;
  }

  // 재귀적으로 children 배열을 처리하는 함수
  const processChildren = (items, parentId = '') => {
    return items.map((item, itemIndex) => {
      const itemId = parentId ? `${parentId}-${itemIndex}` : `api-item-${itemIndex}`;
      // 하위 항목이 있는 경우 (상위 카테고리)
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        return {
          id: itemId,
          title: item.cContents || item.cname || 'Untitled',
          type: 'collapse',
          // icon: '' // 필요시 빈 값, 아니면 아예 제거
          children: processChildren(item.children, itemId),
          breadcrumbs: false
        };
      } 
      // 하위 항목이 없는 경우 (실제 데이터 항목)
      else {
        return {
          id: itemId,
          title: item.cContents || item.cname || 'Untitled',
          type: 'item',
          url: `/dashboard/data-analytics`,
          breadcrumbs: false,
          draggable: true,
          statblid: item.statblid || item.cCode || '',
          figures: item.figures || '0',
          newdate: item.newdate || '202301',
          ctype: item.ctype || ''
        };
      }
    });
  };

  const children = processChildren(apiData);
  

  return {
    id: 'data-analytics',
    title: '통계 데이터',
    type: 'collapse',
    icon: 'components',
    children
  };
};
