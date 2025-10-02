'use client';
import PropTypes from 'prop-types';

// next
import Image from 'next/image';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import { ThemeMode } from 'config';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * const logoDark = '/assets/images/logo-dark.svg';
 * const logo = '/assets/images/logo.svg';
 *
 */

// REB 로고 이미지 설정
const logoDark = '/assets/images/REB/reb_logo.svg';
const logo = '/assets/images/REB/reb_logo.svg';
const logoOpen = '/assets/images/REB/reb_logo2.svg';
const logoOpenDark = '/assets/images/REB/reb_logo2.svg';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain({ reverse, isOpen = true }) {
  const theme = useTheme();

  // 메뉴 상태에 따라 로고 선택
  const getLogoSrc = () => {
    if (isOpen) {
      return theme.palette.mode === ThemeMode.DARK ? logoOpenDark : logoOpen;
    }
    return theme.palette.mode === ThemeMode.DARK ? logoDark : logo;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Image 
        src={getLogoSrc()} 
        alt="REB" 
        width={118} 
        height={35}
        priority
      />
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600,
          fontFamily: '"Noto Sans", ' + theme.typography.fontFamily,
          fontSize: 'calc(1em + 1pt)',
          color: theme.palette.mode === ThemeMode.DARK ? theme.palette.common.white : theme.palette.common.black,
          display: { xs: 'none', sm: 'block' }, // 모바일에서는 텍스트 숨김
          marginTop: isOpen ? '10px' : '0px' // 메뉴가 열렸을 때 아래로 10px 이동
        }}
      >
        AI Platform
      </Typography>
    </Box>
  );
}

LogoMain.propTypes = { 
  reverse: PropTypes.bool, 
  isOpen: PropTypes.bool 
};
