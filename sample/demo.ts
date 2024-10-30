import { NAVISDKClient } from "navi-sdk";
import * as dotenv from "dotenv";
import { swap } from '../src/main';

dotenv.config();

const mnemonic = process.env.MNEMONIC;
const rpc = process.env.RPC;
const client = new NAVISDKClient({
    mnemonic: mnemonic,
    networkType: rpc,
});

const account = client.accounts[0];
console.log(`Account address: ${account.address}`);


// Example usage:
const tokenA = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const tokenB = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
const amount = 1e6;    // 1e9 = 1 SUI
const slippage = 10; // 5% slippage
const minAmountOut = 1e5; // Minimum amount of tokenB to receive is 1 wUSDC

swap(account.address, account.client, tokenA, tokenB, amount, minAmountOut, true, account.keypair).then(async res => {
    console.log(await res.status);
    console.log(await res.balanceChanges);
});
