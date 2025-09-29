import PropTypes from 'prop-types';
import NextLink from 'next/link';

import ButtonBase from '@mui/material/ButtonBase';

// project imports
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';

import { APP_DEFAULT_PATH } from 'config';

export default function LogoSection({ reverse, isIcon, sx, to, isOpen }) {
  return (
    <ButtonBase disableRipple component={NextLink} href={to || APP_DEFAULT_PATH} sx={sx}>
      {isIcon ? <LogoIcon isOpen={isOpen} /> : <LogoMain reverse={reverse} isOpen={isOpen} />}
    </ButtonBase>
  );
}

LogoSection.propTypes = { 
  reverse: PropTypes.bool, 
  isIcon: PropTypes.bool, 
  sx: PropTypes.any, 
  to: PropTypes.string, 
  isOpen: PropTypes.bool 
};
