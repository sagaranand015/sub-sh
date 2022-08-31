import Web3 from 'web3';
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json' assert {type: 'json'};
import { LSPFactory } from '@lukso/lsp-factory.js';

const PRIVATE_KEY = "0xc2bb2b2d8a9de4c99317d909afd713546fe0ea690278ee3c908cde90498f4e84"
const RPC_ENDPOINT = "https://rpc.l16.lukso.network";

const provider = 'https://rpc.l16.lukso.network'; // RPC provider url
let contracts;
const web3 = new Web3(RPC_ENDPOINT);

// l14 relayer uses smart contracts v0.5.0
const chainId = 2828;
// const version = chainId === 2828 ? LSP7Mintable_0_5_0.bytecode : null;

// INITIATE the LSPFactory
// const factory = new LSPFactory(provider, { chainId });
const factory = new LSPFactory(provider, {
  deployKey: PRIVATE_KEY,
  chainId: 2828, // Chain Id of the network you want to deploy to
});

try {
  contracts = await factory.LSP8IdentifiableDigitalAsset.deploy(
    {
      name: 'Some TEst Token',
      symbol: 'STT',
      controllerAddress: '0x431507Dfcae689e28922dE3FAeDDCB6c7478d801', // the "issuer" of the asset, that is allowed to change meta data
      isNFT: true, // Token decimals set to 18
    },
    {
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log(deploymentEvent);

          if (deploymentEvent.status === 'COMPLETE')  {
            console.log("===== done with deployment");
          }
        },
        error: (error) => {
          console.log("===== error with deployment", error);
        },
        complete: async (contracts) => {
          console.log('Deployment Complete');
          console.log(contracts);
        },
      },
    }
  );
} catch (err) {
  console.warn(err.message);
}













// const web3 = new Web3(RPC_ENDPOINT);
// const appEOA = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

// console.log("appEOA os ", appEOA);

// // create an instance
// const myToken = new web3.eth.Contract(LSP7Mintable.abi, {
//   gas: 5_000_000,
//   gasPrice: '1000000000',
// });

// // deploy the token contract
// await myToken
//   .deploy({
//     data: LSP7Mintable.bytecode,
//     arguments: [
//       'My LSP7 Token', // token name
//       'LSP7', // token symbol
//       '0x2D17F96A7910860704f6902896802919840f0A20', // new owner, who will mint later
//       false, // isNonDivisible = TRUE, means NOT divisible, decimals = 0)
//     ]
//   })
//   .send({
//     from: '0x431507Dfcae689e28922dE3FAeDDCB6c7478d801',
//   }).then(res => {
//     console.log("======== res is: ", res);
//   });
