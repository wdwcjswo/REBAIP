'use client';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import { ThemeDirection } from 'config';

//asset
const WelcomeImage = '/assets/images/analytics/welcome-banner.png';
const WelcomeImageArrow = '/assets/images/analytics/welcome-arrow.png';

// ==============================|| DATA ANALYTICS - WELCOME ||============================== //

export default function DataAnalyticsWelcomeBanner() {
  return (
    <MainCard
      border={false}
      sx={(theme) => ({
        background: `linear-gradient(250.38deg, ${theme.palette.primary.lighter} 2.39%, ${theme.palette.primary.light} 34.42%, ${theme.palette.primary.main} 60.95%, ${theme.palette.primary.dark} 84.83%, ${theme.palette.primary.darker} 104.37%)`,
        ...(theme.direction === ThemeDirection.RTL && {
          background: `linear-gradient(60.38deg, ${theme.palette.primary.lighter} 114%, ${theme.palette.primary.light} 34.42%, ${theme.palette.primary.main} 60.95%, ${theme.palette.primary.dark} 84.83%, ${theme.palette.primary.darker} 104.37%)`
        })
      })}
    >
      <Grid container>
        <Grid size={{ md: 6, sm: 6, xs: 12 }}>
          <Stack
            sx={(theme) => ({ gap: 2, padding: 3.4, color: 'background.paper', ...theme.applyStyles('dark', { color: 'text.primary' }) })}
          >
            <Typography variant="h2">AI 데이터 분석 플랫폼</Typography>
            <Typography variant="h6">
              고급 AI 기술을 활용한 데이터 분석 및 통계 서비스를 제공합니다. 실시간 데이터 처리와 인사이트 도출을 통해 비즈니스 성장을 지원합니다.
            </Typography>
            <Box>
              <Button
                variant="outlined"
                color="secondary"
                sx={(theme) => ({
                  color: 'background.paper',
                  borderColor: 'background.paper',
                  ...theme.applyStyles('dark', { color: 'text.primary', borderColor: 'text.primary' }),
                  '&:hover': {
                    color: 'background.paper',
                    borderColor: 'background.paper',
                    bgcolor: 'primary.main',
                    ...theme.applyStyles('dark', { color: 'text.primary', borderColor: 'text.primary', bgcolor: 'primary.dark' })
                  }
                })}
              >
                통계 데이터 보기
              </Button>
            </Box>
          </Stack>
        </Grid>
        <Grid sx={{ display: { xs: 'none', sm: 'initial' } }} size={{ sm: 6, xs: 12 }}>
          <Stack sx={{ alignItems: 'flex-end', justifyContent: 'center', position: 'relative', pr: { sm: 3, md: 8 } }}>
            <CardMedia component="img" src={WelcomeImage} alt="Welcome" sx={{ width: 'auto' }} />
            <Box sx={{ position: 'absolute', bottom: 0, right: '10%' }}>
              <CardMedia component="img" src={WelcomeImageArrow} alt="Welcome Arrow" />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
