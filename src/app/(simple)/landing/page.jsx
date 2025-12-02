'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <Box>
          <Typography variant="h2" sx={{ mb: 2 }}>
            Welcome to REB AI Platform
          </Typography>
          <Typography variant="h6" color="text.secondary">
            랜딩 페이지는 현재 개발 중입니다.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
