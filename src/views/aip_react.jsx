"use client";

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

const navItems = [
  { icon: 'xi-chart-bar', label: '데이터' },
  { icon: 'xi-presentation', label: '통계' },
  { icon: 'xi-globus', label: '지도' },
  { icon: 'xi-message', label: 'AI GPT' },
  { icon: 'xi-cog', label: '환경설정' },
];

const tabItems = [
  { label: '한국부동산원' },
  { label: '아파트정보' },
  { label: '외부기관 데이터' },
];

const AIPReact = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 네비게이션 */}
      <Box sx={{ width: 220, bgcolor: 'background.paper', height: '100vh', position: 'fixed', left: 0, top: 0, borderRight: 1, borderColor: 'divider', zIndex: 10 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <a href=""><img src="images/reb_logo.svg" alt="reb 로고" style={{ width: 120 }} /></a>
        </Box>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {navItems.map((item, idx) => (
            <Box component="li" key={item.label} sx={{ px: 2, py: 1, bgcolor: idx === 0 ? 'action.selected' : undefined }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                <i className={item.icon}></i>
                <Typography variant="body2">{item.label}</Typography>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
      {/* 메인 레이아웃 */}
      <Box sx={{ ml: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="images/icon01.svg" alt="아이콘" style={{ height: 32 }} />
            <Typography variant="h5">Ai 데이터 분석</Typography>
          </Box>
          <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
            <Typography variant="body2">공지사항</Typography>
            <Typography variant="body2">REB AI Platform</Typography>
          </Box>
        </Box>
        {/* 탭 & 콘텐츠 */}
        <Box sx={{ p: 3, flex: 1 }}>
          <Paper elevation={0} sx={{ mb: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
              {tabItems.map((item, idx) => (
                <Tab key={item.label} label={item.label} />
              ))}
            </Tabs>
          </Paper>
          {/* 탭별 콘텐츠 영역 - 예시 구조 */}
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">데이터 셋</Typography>
                  {/* 메뉴/트리 등 추가 구현 */}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">히스토리</Typography>
                  {/* 히스토리 영역 추가 구현 */}
                </Paper>
              </Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">아파트정보</Typography>
                  {/* 아파트정보 영역 추가 구현 */}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">히스토리</Typography>
                  {/* 히스토리 영역 추가 구현 */}
                </Paper>
              </Grid>
            </Grid>
          )}
          {tab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">외부기관 데이터</Typography>
                  {/* 외부기관 데이터 영역 추가 구현 */}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 200 }}>
                  <Typography variant="h6">히스토리</Typography>
                  {/* 히스토리 영역 추가 구현 */}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
        {/* 하단 GPT/히스토리 영역 */}
        <Box sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 4 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <i className="xi-chart-bar"></i> <span>히스토리</span>
                </Typography>
                <Box id="tab_07" className="gtpHis" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <i className="xi-chart-bar"></i> <span>AI 데이터 분석</span>
                </Typography>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <iframe id="chat-frame" src="http://172.16.10.57:8080/" width="100%" height="300" frameBorder="0" title="chat-frame"></iframe>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <Box component="footer" sx={{ py: 2, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }} />
      </Box>
    </Box>
  );
};

export default AIPReact;
