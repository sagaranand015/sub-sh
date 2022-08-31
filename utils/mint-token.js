
import Web3 from 'web3';
// import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json' assert {type: 'json'};
// import { LSPFactory } from '@lukso/lsp-factory.js';

const RPC_ENDPOINT = "https://rpc.l16.lukso.network";
const web3 = new Web3(RPC_ENDPOINT);

const PRIVATE_KEY = "0xc2bb2b2d8a9de4c99317d909afd713546fe0ea690278ee3c908cde90498f4e84"
const appEOA = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);


const provider = 'https://rpc.l16.lukso.network'; // RPC provider url
let contracts;

import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json' assert {type: 'json'};

  const lsp8IdentifiableDigitalAssetContract = new web3.eth.Contract(LSP8Mintable.abi, '0xd95f2C5B56586628945687b7515450dc6eA0C2ea', {gas: 5_000_000,
  gasPrice: '1000000000'});

  console.log("====== token contract is: ", lsp8IdentifiableDigitalAssetContract);

  web3.eth.accounts.wallet.add(PRIVATE_KEY);

  const account = '0xd95f2C5B56586628945687b7515450dc6eA0C2ea';
  const to = '0xdAf877ECE34Fc1370d4F5fF52e5993C433472F57';
  const force = true; // When set to TRUE, to may be any address; when set to FALSE to must be a contract that supports LSP1 UniversalReceiver and not revert.
  const data = '0x';
  const paddedTokenId = web3.utils.padRight(web3.utils.stringToHex(1), 64);

  try {
    await lsp8IdentifiableDigitalAssetContract.methods.mint(to, paddedTokenId, force, data).send({ from: account }).then(resp => {
      console.log("=========== response os: ", resp);
    });
    // mintEvents.value.push({ stepName: '✅ Mint the NFT on the LSP8 smart contract', functionName: 'mint', receipt });
  } catch (err) {
    console.log("=========== error is: ", err);
    
  }
