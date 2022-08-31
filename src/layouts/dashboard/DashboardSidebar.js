import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';

// mock
import account from '../../_mock/account';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
//
import navConfig from './NavConfig';

import { GetConnectedWalletUPData } from '../../lukso/universal_profiles';
import { GetGlobalState, UpdateSelectedProfileInState, UpdateSelectedAddressInState } from '../../globalState';

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {

  const state = GetGlobalState();
  const [addrSelected, setAddrSelected] = useState(state.selectedAddress);

  async function ConnectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Connected address is:", selectedAddress);  
    UpdateSelectedAddressInState(selectedAddress)
    setAddrSelected(state.selectedAddress);

    const connectedUPData = GetConnectedWalletUPData();
    connectedUPData.then(res => {
      console.log("Got the profile details from Lukso!: ", res);
      UpdateSelectedProfileInState(res.value.LSP3Profile);
    });
  }
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');
  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContentWithoutWalletConnect = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>
      <Box sx={{ mt: 2.5, mb: 5 }} textAlign="center">
        <Button target="_blank" 
          variant="contained" size="large" onClick={() => ConnectWallet()}>
          Connect Wallet
        </Button>
      </Box>
      <NavSection navConfig={navConfig} state={state} />

    </Scrollbar>
  );

  const renderContentWithWalletConnect = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>
      <Box sx={{ mt: 2.5, mb: 5 }} textAlign="center">
        <Button target="_blank" 
          variant="contained" size="large" color="success">
          Wallet Connected
        </Button>
      </Box>
      <NavSection navConfig={navConfig} state={state} />

    </Scrollbar>
  );

  if(!state.selectedAddress) {
    return (
      <RootStyle>
        {!isDesktop && (
          <Drawer
            open={isOpenSidebar}
            onClose={onCloseSidebar}
            PaperProps={{
              sx: { width: DRAWER_WIDTH },
            }}
          >
            {renderContentWithoutWalletConnect}
          </Drawer>
        )}
  
        {isDesktop && (
          <Drawer
            open
            variant="persistent"
            PaperProps={{
              sx: {
                width: DRAWER_WIDTH,
                bgcolor: 'background.default',
                borderRightStyle: 'dashed',
              },
            }}
          >
             {renderContentWithoutWalletConnect}
          </Drawer>
        )}
      </RootStyle>
    );
  }
  

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          {renderContentWithWalletConnect}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
         {renderContentWithWalletConnect}
        </Drawer>
      )}
    </RootStyle>
  );

}
