import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppActionWidget,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';

import { GetGlobalState } from "../globalState";
import { Loading } from "../components/Loading";
import {NoWalletConnectedMessage} from '../components/NoWalletConnectedMessage';

// ----------------------------------------------------------------------

export default function DashboardApp() {

  const theme = useTheme();

  const state = GetGlobalState();

  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if(state.selectedAddress && state.selectedProfile) {
        setShowDashboard(true);
        clearInterval(timer);
      }
    }, 1000);
  }, []);

  if(!state.selectedAddress) {
    return (<NoWalletConnectedMessage />);
  }

  if(!showDashboard && state.selectedAddress) {
    return (<Loading />);
  }
    
  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Welcome to {state.selectedProfile?.name}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AppActionWidget icon={'ant-design:appstore-filled'} btnText="Manage your Stores" path="/dashboard/stores" />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <AppActionWidget icon={'ant-design:usb-filled'} btnText="Manage your Subscriptions" path="/dashboard/tokens" />
          </Grid>

          {/* <Grid item xs={12} sm={6} md={4}>
            <AppActionWidget icon={'ant-design:sound-filled'} btnText="Give Feedback" path="/dashboard/user" />
          </Grid> */}

        </Grid>
      </Container>
    </Page>
  );
}
