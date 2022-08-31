import Web3 from 'web3';
import { LSPFactory } from '@lukso/lsp-factory.js';
import { ERC725 } from '@erc725/erc725.js';
// import { * } from 'isomorphic-fetch';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';

import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json';

import { GetGlobalState } from '../globalState';
import { RPC_ENDPOINT, IPFS_GATEWAY, PRIVATE_KEY, CHAIN_ID } from './constants';

const web3 = new Web3(RPC_ENDPOINT);

export function GetAppEOA() {
    // Step 3.1 - Load our Externally Owned Account (EOA)
    const appEOA = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    return appEOA;
}

export function GetLSPFactory() {
    // Step 3.2
    // Initialize the LSPFactory with the L16 RPC endpoint and your EOA's private key, which will deploy the UP smart contracts
    const lspFactory = new LSPFactory(RPC_ENDPOINT, {
        deployKey: PRIVATE_KEY,
        chainId: CHAIN_ID,
    });
    return lspFactory;
}

export async function CreateStoreUniversalProfile(ctrlAddress, storeMetadata) {
  const lspFactory = GetLSPFactory();
  const deployedContracts = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: [ctrlAddress], // The connected user will control the UP
    lsp3Profile: {
      name: storeMetadata.storeName,
      description: storeMetadata.storeDesc,
      tags: ['Store Profile'],
      links: [
        {
          title: storeMetadata.storeName,
          url: storeMetadata.storeUrl,
        },
      ],
    },
  });

  const newStoreUPAddress = deployedContracts.LSP0ERC725Account.address;
  console.log('Store Universal Profile address: ', newStoreUPAddress);
  return deployedContracts;
    
}

export async function GetConnectedWalletUPContract() {
  const state = GetGlobalState();
  if(!state.selectedAddress) {
    console.error("Wallet is not connected. Please connect wallet first!");
    return null;
  }

  const connectedUPAddress = new web3.eth.Contract(
    UniversalProfile.abi,
    state.selectedAddress,
  );
  console.log("Connected UP is: ", connectedUPAddress);
  return connectedUPAddress;
}

export async function GetUPContract(UPAddress) {
  const upAddrContract = new web3.eth.Contract(
    UniversalProfile.abi,
    UPAddress,
  );
  console.log("UP Contract is: ", upAddrContract);
  return upAddrContract;
}

export async function GetUPData(UPAddress) {
  try {
    const config = { ipfsGateway: IPFS_GATEWAY };
    const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
    const profile = new ERC725(erc725schema, UPAddress, provider, config);
    return await profile.fetchData('LSP3Profile');
  } catch (error) {
      console.log('This is not an ERC725 Contract', error);
  }
}

export async function GetConnectedWalletUPData() {
  const state = GetGlobalState();
  if(!state.selectedAddress) {
    console.error("Wallet is not connected. Please connect wallet first!");
    return null;
  }

  try {
    const config = { ipfsGateway: IPFS_GATEWAY };
    const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
    const profile = new ERC725(erc725schema, state.selectedAddress, provider, config);
    return await profile.fetchData('LSP3Profile');
  } catch (error) {
      console.log('This is not an ERC725 Contract', error);
      return null;
  }
}

export async function BuildUploadProfileDataToIpfs(profileData) {
  const lspFactory = GetLSPFactory();
  const uploadResult = await lspFactory.UniversalProfile.uploadProfileData(
    profileData,
  );
  return uploadResult;
}

export async function EncodeDataViaErc725ForAddress(addr, ipfsUploadedUrl, ipfsUploadedJson) {

    // Step 3.1 - Setup erc725.js
    const schema = [
      {
        name: 'LSP3Profile',
        key: web3.utils.keccak256('LSP3Profile'),
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    const erc725 = new ERC725(schema, addr, web3.currentProvider, {
      ipfsGateway: IPFS_GATEWAY,
    });
  
    // Step 3.2 - Encode the LSP3Profile data (to be written on our UP)
    const encodedData = erc725.encodeData({
      keyName: 'LSP3Profile',
      value: {
        hashFunction: 'keccak256(utf8)',
        // hash our LSP3 metadata JSON file
        hash: web3.utils.keccak256(JSON.stringify(ipfsUploadedJson)),
        url: ipfsUploadedUrl,
      },
    });

    return encodedData;

}

export async function UpdateUPMetadata(profileAddr, encodedDataKey, encodedDataVals) {

  // Step 4.2 - Create instances of our Contracts
  const universalProfileContract = new web3.eth.Contract(
    UniversalProfile.abi,
    profileAddr,
  );

  // universalProfileContract.setProvider(provider);
  const keyManagerAddress = await universalProfileContract.methods
    .owner()
    .call();

  console.log("======= key manager address is: ", keyManagerAddress);

  const appEOA = web3.eth.accounts.wallet.add(PRIVATE_KEY);
  // const appEOA = GetAppEOA();

  const keyManagerContract = new web3.eth.Contract(
    KeyManager.abi,
    keyManagerAddress,
  );
  // keyManagerContract.setProvider(provider);

  // Step 4.3 - Set data (updated LSP3Profile metadata) on our Universal Profile

  // encode the setData payload
  const abiPayload = await universalProfileContract.methods[
    'setData(bytes32[],bytes[])'
  ](encodedDataKey, encodedDataVals).encodeABI();

  // execute via the KeyManager, passing the UP payload
  const res = await keyManagerContract.methods
    .execute(abiPayload)
    .send({ from: appEOA.address, gasLimit: 300_000 }).then(res => {
      console.log("===== success response is: ", res);
    });
  return res;

}

export async function ConnectStoreUPToSelectedAddress(storeUPAddr, storeMetadata) {
  const state = GetGlobalState();
  const selectedAddr = state.selectedAddress;
  const selectedProfileData = state.selectedProfile;

  selectedProfileData.links.push({
    title: storeUPAddr,
    url: storeMetadata.storeUrl,
  });
  selectedProfileData.tags.push(storeUPAddr);

  console.log("Added store data to links. Editing the connecting profile now...", selectedProfileData);

  const ipfsProfileData = BuildUploadProfileDataToIpfs(selectedProfileData);

  ipfsProfileData.then(ipfsRes => {
    console.log("Pushed data to ipfs now...", ipfsRes.url);
    const encData = EncodeDataViaErc725ForAddress(selectedAddr, ipfsRes.url, ipfsRes.json);

    encData.then(encDataRes => {
      console.log("======== final encData is: ", encDataRes.keys, encDataRes.values);

      const txn = UpdateUPMetadata(selectedAddr, encDataRes.keys, encDataRes.values);
      txn.then(txnRes => {
        console.log("All Transactions successful: ", txnRes);
      });
      return txn;

    });
  });
}

// export async function DeployStoreToken(creatingStoreAddr, tokenData) {
//   const factory = GetLSPFactory();
//   const contracts = await factory.LSP7DigitalAsset.deploy(
//     {
//       name: tokenData.name,
//       symbol: tokenData.symbol,
//       controllerAddress: creatingStoreAddr, // the "issuer" of the asset, that is allowed to change meta data
//       isNFT: true, // Token decimals set to 18
//     },
//     {
//       onDeployEvents: {
//         next: (deploymentEvent) => {
//           console.log(deploymentEvent);

//           if (deploymentEvent.status === 'COMPLETE')  {
//             console.log("===== done with deployment");
//           }
//         },
//         error: (error) => {
//           console.log("===== error with deployment", error);
//         },
//         complete: async (contracts) => {
//           console.log('Deployment Complete');
//           console.log(contracts.LSP7DigitalAsset);
//         },
//       },
//     }
//   );
//   return contracts;
// }

export async function DeployStoreToken(creatingStoreAddr, tokenData) {
  const factory = GetLSPFactory();
  console.log("creating token now...")
  const contracts = await factory.LSP8IdentifiableDigitalAsset.deploy(
    {
      name: tokenData.name,
      symbol: tokenData.symbol,
      controllerAddress: creatingStoreAddr, // the "issuer" of the asset, that is allowed to change meta data
      isNFT: true, // Token decimals set to 18
    });
  return contracts;
}

export async function MintStoreToken(creatingStoreAddr) {
  const appEOA = GetAppEOA();
  const lsp8IdentifiableDigitalAssetContract = new web3.eth.Contract(LSP8Mintable.abi, appEOA.address, {gas: 5_000_000,
    gasPrice: '1000000000'});
  
    console.log("====== token contract is: ", lsp8IdentifiableDigitalAssetContract);
  
    web3.eth.accounts.wallet.add(PRIVATE_KEY);
  
    const account = appEOA.address;
    const to = creatingStoreAddr;
    const force = true; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
    const data = '0x';
    const paddedTokenId = web3.utils.padRight(web3.utils.stringToHex(1), 64);
  
    const mintResp = await lsp8IdentifiableDigitalAssetContract.methods.mint(to, paddedTokenId, force, data).send({ from: account });
    return mintResp;
    // try {
    //   await lsp8IdentifiableDigitalAssetContract.methods.mint(to, paddedTokenId, force, data).send({ from: account }).then(resp => {
    //     console.log("=========== response os: ", resp);
    //   });
    //   // mintEvents.value.push({ stepName: '✅ Mint the NFT on the LSP8 smart contract', functionName: 'mint', receipt });
    // } catch (err) {
    //   console.log("=========== error is: ", err);
      
    // }

}

export async function GetStoreAssets(storeAddr) {
  // Fetch the LSP5 data of the Universal Profile to get its owned assets
  console.log("====== starting getting assets...");
  const config = { ipfsGateway: IPFS_GATEWAY };
  const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);

  const profile = new ERC725(
    erc725schema,
    storeAddr,
    provider,
    config,
  );
  const result = await profile.fetchData();
  console.log("======= result is: ", result);
  // const ownedAssets = result.value;
  // console.log(ownedAssets);
}