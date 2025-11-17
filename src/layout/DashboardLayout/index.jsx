
"use client";
import React, { createContext, useContext } from 'react';
// Context 생성
export const ChartImageHistoryContext = createContext({
  chartImageHistory: [],
  setChartImageHistory: () => {}
});
import PropTypes from 'prop-types';

import { useEffect } from 'react';

// next
import { usePathname } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import Drawer from './Drawer';
import Header from './Header';
import HorizontalBar from './Drawer/HorizontalBar';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import AuthGuard from 'utils/route-guard/AuthGuard';
import { useState } from 'react';
import AiComponent from './AiComponent';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu.jsx';

// ==============================|| MAIN LAYOUT ||============================== //


export default function DashboardLayout({ children }) {

  const pathname = usePathname();
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;


  // 오른쪽 패널 width 상태 (최소 320, 최대 900)
  const [rightPanelWidth, setRightPanelWidth] = useState(550);
  const minWidth = 320;
  const maxWidth = 900;
  // 드래그 상태
  const [isResizing, setIsResizing] = useState(false);

  // 마우스 드래그 핸들러
  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    // 레이아웃 기준으로 상대 좌표 계산
    const layoutRect = document.getElementById('dashboard-layout-main')?.getBoundingClientRect();
    if (!layoutRect) return;
    let newWidth = layoutRect.right - e.clientX;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setRightPanelWidth(newWidth);
  };
  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
  };
  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // chartImageHistory 상태를 여기서 관리
  const [chartImageHistory, setChartImageHistory] = useState([]);

  // chartImageHistory 값이 변경될 때마다 로그 출력
  React.useEffect(() => {
    console.log('[DashboardLayout] chartImageHistory:', chartImageHistory);
  }, [chartImageHistory]);

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  return (
    <AuthGuard>
      <ChartImageHistoryContext.Provider value={{ chartImageHistory, setChartImageHistory }}>
        {/* 헤더를 항상 최상단에 고정, width: 100% */}
        <Header />
        {/* 헤더 아래 전체를 flex row로 Drawer+Main+AI 배치*/}
        <Box width={1} sx={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 64px)' }}>
          {/* Drawer(사이드바) */}
          {!isHorizontal ? <Drawer /> : <HorizontalBar />}
          {/* Main+AI 가로 레이아웃 */}
          <Box sx={{ display: 'flex', flex: 1, minWidth: 0 }} id="dashboard-layout-main">
            {/* 메인 컨텐츠 */}
            <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit' }} />
              <Container
                maxWidth={container ? 'xl' : false}
                sx={{
                  ...(container && { px: { xs: 0, sm: 2 } }),
                  position: 'relative',
                  minHeight: 'calc(100vh - 110px)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                {children}
              </Container>
            </Box>
            {/* 리사이저 바 - Main+AI 영역만 */}
            <Box
              sx={{
                width: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'col-resize',
                zIndex: 1210, // Drawer보다 위, Header(1100)보다 아래
                background: isResizing ? 'rgba(0,0,0,0.08)' : 'transparent',
                transition: 'background 0.2s',
                '&:hover': { background: 'rgba(0,0,0,0.08)' },
                userSelect: 'none',
                top: 64, // 헤더 높이만큼 아래
                height: 'calc(100% - 64px)',
                position: 'relative',
                minHeight: 'calc(100vh - 110px)'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* 세로 점 3개 SVG 아이콘 */}
              <svg width="8" height="32" viewBox="0 0 8 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="6" r="2" fill="#bbb" />
                <circle cx="4" cy="16" r="2" fill="#bbb" />
                <circle cx="4" cy="26" r="2" fill="#bbb" />
              </svg>
            </Box>
            {/* AiComponent */}
            <AiComponent width={rightPanelWidth}/>
          </Box>
        </Box>
      </ChartImageHistoryContext.Provider>
    </AuthGuard>
  );
}


DashboardLayout.propTypes = { children: PropTypes.node };
