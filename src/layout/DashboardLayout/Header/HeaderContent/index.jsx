import { useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project imports
// Search component removed to hide header search box
import Message from './Message';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import FullScreen from './FullScreen';
import Customization from './Customization';
import MobileSection from './MobileSection';
import MegaMenuSection from './MegaMenuSection';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));  //화면 너비 1200px 기준

  const localization = useMemo(() => <Localization />, []);

  const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {/* Search */}
      {/*!downLG && megaMenu*/}
      {/*!downLG && localization*/}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      {/*<Notification />*/}
      {/*<Message />*/}
      {!downLG && <FullScreen />}
      {/*<Customization />*/}
      {/* <Box sx={{ ml: 'auto' }}>
        {!downLG && <Profile />}
        {downLG && <MobileSection />}
      </Box> */}
    </>
  );
}
