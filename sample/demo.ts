import { NAVISDKClient } from "navi-sdk";
import * as dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";
import { SignAndSubmitTXB } from 'navi-sdk/dist/libs/PTB'
import { getRoutePTB } from '../src/main';
import { assert } from "console";

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
const tokenA = '0x2::sui::SUI';
const tokenB = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
const amount = 1e9;    // 1e9 = 1 SUI
const slippage = 5; // 5% slippage
const minAmountOut = 1e6; // Minimum amount of tokenB to receive is 1 wUSDC

const txb = new Transaction();
txb.setSender(account.address);

getRoutePTB(account.client, txb, account.address, tokenA, tokenB, amount, minAmountOut).then(async (txb) => {
    // 1. Dry run the transaction and get the response
    const dryRunTxBytes: Uint8Array = await txb.build({
        client: account.client
    });
    const response = await account.client.dryRunTransactionBlock({ transactionBlock: dryRunTxBytes });
    assert(response.effects.status.status == 'success', 'Transaction failed');
    console.log(response);

    // 2. Sign and submit the transaction
    await SignAndSubmitTXB(txb, account.client, account.keypair);
}).catch((error) => {
    console.error(error);
});