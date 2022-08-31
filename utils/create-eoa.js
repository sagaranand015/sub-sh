import Web3 from 'web3';
const web3 = new Web3();

const myEOA = web3.eth.accounts.create();
console.log(myEOA);

/**
{
  address: "0x...",
    privateKey: "0x...",
    signTransaction: function(tx){...},
    sign: function(data){...},
    encrypt: function(password){...}
}
*/
