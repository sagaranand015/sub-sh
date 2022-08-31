import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { Link, Stack, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from './Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from './hook-form';

// backend imports
import { CreateStoreUniversalProfile, ConnectStoreUPToSelectedAddress } from '../lukso/universal_profiles';
import { GetGlobalState } from '../globalState';

// ----------------------------------------------------------------------

export default function NewStoreForm() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const NewStoreSchema = Yup.object().shape({
    storeName: Yup.string().required('Store Name is required'),
    storeDesc: Yup.string(),
    storeUrl: Yup.string().url('URL must be a valid URL'),

  });

  const defaultValues = {
    storeName: '',
    storeDesc: '',
    storeUrl: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewStoreSchema),
    defaultValues,
  });

  const {
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {

    setIsSubmitting(true);

    const state = GetGlobalState();
    if(!state.selectedAddress) {
      console.log("Wallet has not been connected. Please connect wallet first!");
      alert("Wallet has not been connected. Please connect wallet first!");
      setIsSubmitting(false);
    }
    else {
      const storeUPContract = await CreateStoreUniversalProfile(state.selectedAddress, data);
      console.log("Store UP has been created: ", storeUPContract.LSP0ERC725Account.address);
      const updateTxn = await ConnectStoreUPToSelectedAddress(storeUPContract.LSP0ERC725Account.address, data).then(res => {
        setIsSubmitting(false);
        alert("Store Creation Finished. Please reload the application to see store details");
      });
      // navigate('/dashboard/stores', { replace: true });
    }
    
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>

        <RHFTextField name="storeName" label="Store Name" />

        <RHFTextField name="storeDesc" label="Store Description" multiline rows="4" />

        <RHFTextField name="storeUrl" label="Store Website URL" />

      </Stack>

      <LoadingButton fullWidth size="large" type="submit" loading={isSubmitting} variant="contained"  sx={{ my: 4 }}>
        Create Store
      </LoadingButton>
    </FormProvider>
  );
}
