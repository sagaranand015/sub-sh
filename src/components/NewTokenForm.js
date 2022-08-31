import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { Link, Stack, IconButton, InputAdornment, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from './Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from './hook-form';

// backend imports
import { CreateStoreUniversalProfile, ConnectStoreUPToSelectedAddress, DeployStoreToken, GetStoreAssets, MintStoreToken } from '../lukso/universal_profiles';
import { AddToStoreTokens, GetGlobalState, UpdateSelectedStore } from '../globalState';

// ----------------------------------------------------------------------

export default function NewTokenForm() {
  const navigate = useNavigate();
  const state = GetGlobalState();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedStore, setSelectedStore] = useState(state.allStores[0]);

  const [tokenDetails, setTokenDetails] = useState('');

  const [mintedTokenDetails, setMintedTokenDetails] = useState('');

  const NewStoreSchema = Yup.object().shape({
  });

  const defaultValues = {
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
    
    if(!state.selectedAddress) {
      console.log("Wallet has not been connected. Please connect wallet first!");
      alert("Wallet has not been connected. Please connect wallet first!");
      setIsSubmitting(false);
    }
    else if(!state.selectedStore) {
      console.log("Please select a store before proceeding to create a token");
      alert("Please select a store before proceeding to create a token");
      setIsSubmitting(false);
    }
    else {
      console.log("token to be created here for store: ", selectedStore.name, selectedStore.id);

      const tokenData = {
        'name': '{$selectedStore.name} Subscription',
        'symbol': 'SKN',
      }

      try {
        DeployStoreToken(selectedStore.id, tokenData).then(resp => {
          console.log("===== response from call is: ", resp);
          const deployedTokenAddr = resp.LSP8IdentifiableDigitalAsset.address;
          setTokenDetails(deployedTokenAddr);
          AddToStoreTokens(selectedStore.id, resp.LSP8IdentifiableDigitalAsset.address);
  
          MintStoreToken(selectedStore.id).then(mintResp => {
            console.log("====== minting token response: ", mintResp);
            setMintedTokenDetails(mintResp.transactionHash);
            alert("Your Token has been deployed and minted. Please check the data displayed!");
            setIsSubmitting(false);
          }); 
        });
      } catch(error) {
        console.log("Error during deploying and minting token..", error);
        alert("Error during deploying and minting token. Please check console for details");
            setIsSubmitting(false);
      }

      // GetStoreAssets('0x431507Dfcae689e28922dE3FAeDDCB6c7478d801');

    }
    
  };

  const onChange = (event, child) => {
    console.log(event.target.value);
    state.allStores.forEach(s => {
      if(String(s.name) === String(event.target.value)) {
        setSelectedStore(s);
        UpdateSelectedStore(s);
      }
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>

      <Select
        value={selectedStore.name}
        onChange={onChange}
        inputProps={{
          name: "selectedStore",
          id: "selected-store"
        }}
      >
        {state.allStores.map((value, index) => {
          return <MenuItem key={value.id} data-id={value.id} value={value.name}>{value.name}</MenuItem>;
        })}
      </Select>

        <Typography variant="h5" gutterBottom>
          Deployed Token Address: {tokenDetails}
        </Typography>

        <Typography variant="h5" gutterBottom>
          Minted Token Txn: {mintedTokenDetails}
        </Typography>

      </Stack>

      <LoadingButton fullWidth size="large" type="submit" loading={isSubmitting} variant="contained"  sx={{ my: 4 }}>
        Create Token
      </LoadingButton>
    </FormProvider>
  );
}
