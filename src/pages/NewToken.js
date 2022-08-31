import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Card, Link, Container, Typography, Stack } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';
import NewStoreForm from '../components/NewStoreForm';
import NewTokenForm from '../components/NewTokenForm';
// sections
// import { LoginForm } from '../sections/auth/login';
// import AuthSocial from '../sections/auth/AuthSocial';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(5, 5),
}));

// ----------------------------------------------------------------------

export default function NewToken() {
  const smUp = useResponsive('up', 'sm');

  return (
    <Page title="NewStore">
      <RootStyle>
        <Container>
          <Card>
            <ContentStyle>
              <Typography variant="h4" gutterBottom>
                Create New Token
              </Typography>

              <Typography sx={{ color: 'text.secondary', mb: 5 }}>Enter Token details below.</Typography>

              <NewTokenForm />

              {!smUp && (
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                  Don’t have an account?{' '}
                  <Link variant="subtitle2" component={RouterLink} to="/register">
                    Get started
                  </Link>
                </Typography>
              )}
            </ContentStyle>
          </Card>
        </Container>
      </RootStyle>
    </Page>
  );
}
