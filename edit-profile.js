import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';
import { LSPFactory } from '@lukso/lsp-factory.js';

import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json' assert {type: 'json'};
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json' assert {type: 'json'};

import jsonFile from './UniversalProfileMetadata.json' assert {type: 'json'};

const web3 = new Web3('https://rpc.l16.lukso.network');

// constants
const PRIVATE_KEY = '0xc2bb2b2d8a9de4c99317d909afd713546fe0ea690278ee3c908cde90498f4e84';
const profileAddress = '0x431507Dfcae689e28922dE3FAeDDCB6c7478d801';

// Step 1 - Create a new LSP3Profile JSON file

const provider = 'https://rpc.l16.lukso.network'; // RPC provider url

const lspFactory = new LSPFactory(provider, {
  deployKey: PRIVATE_KEY,
  chainId: 2828, // Chain Id of the network you want to deploy to
});

async function editProfileInfo() {

  console.log("==== data before IPFS upload is: ", jsonFile.LSP3Profile);

  // Step 2 - Upload our JSON file to IPFS
  const uploadResult = await lspFactory.UniversalProfile.uploadProfileData(
    jsonFile.LSP3Profile,
  );
  const lsp3ProfileIPFSUrl = uploadResult.url;
  // 'ipfs://QmYCQTe5r5ZeVTbtpZMZXSQP2NxXdgJFVZb61Dk3gFP5VX'

  console.log("==== ipfs URL is: ", lsp3ProfileIPFSUrl);

  // Step 3.1 - Setup erc725.js
  const schema = [
    {
      name: 'LSP3Profile',
      key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      keyType: 'Singleton',
      valueContent: 'JSONURL',
      valueType: 'bytes',
    },
  ];

  const erc725 = new ERC725(schema, profileAddress, web3.currentProvider, {
    ipfsGateway: 'https://2eff.lukso.dev/ipfs/',
  });

  // Step 3.2 - Encode the LSP3Profile data (to be written on our UP)
  const encodedData = erc725.encodeData({
    keyName: 'LSP3Profile',
    value: {
      hashFunction: 'keccak256(utf8)',
      // hash our LSP3 metadata JSON file
      hash: web3.utils.keccak256(JSON.stringify(uploadResult.json)),
      url: lsp3ProfileIPFSUrl,
    },
  });

  // Step 4.1 - Load our EOA
  const myEOA = web3.eth.accounts.wallet.add(PRIVATE_KEY);
  console.log('EOA:', myEOA.address);

  // Step 4.2 - Create instances of our Contracts
  const universalProfileContract = new web3.eth.Contract(
    UniversalProfile.abi,
    profileAddress,
  );

  const keyManagerAddress = await universalProfileContract.methods
    .owner()
    .call();
  const keyManagerContract = new web3.eth.Contract(
    KeyManager.abi,
    keyManagerAddress,
  );

  // Step 4.3 - Set data (updated LSP3Profile metadata) on our Universal Profile

  // encode the setData payload
  const abiPayload = await universalProfileContract.methods[
    'setData(bytes32[],bytes[])'
  ](encodedData.keys, encodedData.values).encodeABI();

  // execute via the KeyManager, passing the UP payload
  await keyManagerContract.methods
    .execute(abiPayload)
    .send({ from: myEOA.address, gasLimit: 300_000 }).then(res => {
      console.log("===== success result is: ", res);
    });
}
editProfileInfo();
