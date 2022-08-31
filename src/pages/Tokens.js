import { useState } from 'react';
// material
import { Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Iconify from '../components/Iconify';
// components
import Page from '../components/Page';
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/products';
// mock
import PRODUCTS from '../_mock/products';

// ----------------------------------------------------------------------

export default function Tokens() {
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  return (
    <Page title="Stores">
        <Container>

          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Your Store Tokens
            </Typography>
            <Button variant="contained" component={RouterLink} to="/dashboard/newtoken" startIcon={<Iconify icon="eva:plus-fill" />}>
              Create New Token
            </Button>
          </Stack>

        </Container>
      </Page>
  );
}
