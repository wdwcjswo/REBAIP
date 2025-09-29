import PropTypes from 'prop-types';

// next
import Image from 'next/image';

// material-ui
import { useTheme } from '@mui/material/styles';

// project imports
import { ThemeMode } from 'config';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * const logoIconDark = '/assets/images/logo-icon-dark.svg';
 * const logoIcon = '/assets/images/logo-icon.svg';
 * import { ThemeMode } from 'config';
 */

// REB 로고 아이콘 이미지 설정
const logoIconDark = '/assets/images/REB/reb_logo.svg';
const logoIcon = '/assets/images/REB/reb_logo.svg';
const logoIconOpen = '/assets/images/REB/reb_logo2.svg';
const logoIconOpenDark = '/assets/images/REB/reb_logo2.svg';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon({ isOpen = false }) {
  const theme = useTheme();

  // 메뉴 상태에 따라 로고 선택
  const getLogoSrc = () => {
    if (isOpen) {
      return theme.palette.mode === ThemeMode.DARK ? logoIconOpenDark : logoIconOpen;
    }
    return theme.palette.mode === ThemeMode.DARK ? logoIconDark : logoIcon;
  };

  // 메뉴 상태에 따라 크기 조정
  const getLogoSize = () => {
    return isOpen ? 72 : 45; // 열렸을 때 더 작은 크기 (103 * 0.7 ≈ 72), 접혔을 때 작은 크기
  };

  const logoSize = getLogoSize();

  return (
    <Image 
      src={getLogoSrc()} 
      alt="REB" 
      width={logoSize} 
      height={logoSize}
      priority
    />
  );
}

LogoIcon.propTypes = { 
  isOpen: PropTypes.bool 
};
