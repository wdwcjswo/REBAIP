'use client';
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

import AddCustomer from 'sections/apps/customer/AddCustomer';
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

  // AI 컴포넌트 상태
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const handleToggleRightPanel = () => setRightPanelOpen((prev) => !prev);

  // chartImageHistory 전달용: children이 함수형이면 prop으로 전달, 아니면 context 필요
  // 여기서는 children이 DashboardDataAnalytics일 때만 chartImageHistory prop을 추출
  let chartImageHistory = [];
  if (children && children.props && children.props.chartImageHistory) {
    chartImageHistory = children.props.chartImageHistory;
  } else if (children && children.type && children.type.name === 'DashboardDataAnalytics' && children.props) {
    chartImageHistory = children.props.chartImageHistory || [];
  }

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
      <Box width={1} display="flex" flexDirection="row">
        <Header />
        {!isHorizontal ? <Drawer /> : <HorizontalBar />}
        <Box sx={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
            <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit' }} />
            <Container
              maxWidth={container ? 'xl' : false}
              sx={{
                ...(container && { px: { xs: 0, sm: 2 } }),
                position: 'relative',
                minHeight: 'calc(100vh - 110px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {pathname !== '/apps/profiles/account/my-account' && <Breadcrumbs />}
              {children}
            </Container>
          </Box>
          {/* AiComponent */}
          <AiComponent open={rightPanelOpen} onToggle={handleToggleRightPanel} chartImageHistory={chartImageHistory} />
        </Box>
        <AddCustomer />
      </Box>
    </AuthGuard>
  );
}


DashboardLayout.propTypes = { children: PropTypes.node };
