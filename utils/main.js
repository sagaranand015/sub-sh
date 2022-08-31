import Web3 from 'web3';
import { LSPFactory } from '@lukso/lsp-factory.js';

const web3 = new Web3();

// Step 3.1 - Load our Externally Owned Account (EOA)
const PRIVATE_KEY = '0xc2bb2b2d8a9de4c99317d909afd713546fe0ea690278ee3c908cde90498f4e84'; // add the private key of your EOA here (created in Step 1)
const myEOA = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

// Step 3.2
// Initialize the LSPFactory with the L16 RPC endpoint and your EOA's private key, which will deploy the UP smart contracts
const lspFactory = new LSPFactory('https://rpc.l16.lukso.network', {
  deployKey: PRIVATE_KEY,
  chainId: 2828,
});

// Step 3.3 - Deploy our Universal Profile
async function createUniversalProfile() {
  const deployedContracts = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: ["0x174Be8Ac01Af45EcD980739d3b6a42C9fc860Cd8"], // our EOA that will be controlling the UP
    lsp3Profile: {
      name: 'StoreDemo01',
      description: 'My Cool Universal Profile for StoreDemo01',
      tags: ['Store Profile'],
      links: [
        {
          title: 'My Website',
          url: 'https://twitter.com',
        },
      ],
    },
  });

  const myUPAddress = deployedContracts.LSP0ERC725Account.address;
  console.log('my Universal Profile address: ', myUPAddress);

  return deployedContracts;
}

createUniversalProfile();

