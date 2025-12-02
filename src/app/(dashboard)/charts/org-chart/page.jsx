'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

// ==============================|| PAGE ||============================== //

export default function OrgChartPage() {
  return (
    <MainCard title="Org Chart">
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          조직도 페이지는 현재 개발 중입니다.
        </Typography>
      </Box>
    </MainCard>
  );
}
