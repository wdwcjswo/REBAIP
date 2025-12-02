'use client';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function Pricing() {
  return (
    <MainCard title="요금제 (Pricing)">
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          요금제 페이지는 현재 개발 중입니다.
        </Typography>
      </Box>
    </MainCard>
  );
}
