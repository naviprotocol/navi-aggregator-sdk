import { returnMergedCoins, SignAndSubmitTXB } from 'navi-sdk/dist/libs/PTB';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/dist/cjs/client';
import { Ed25519Keypair } from '@mysten/sui/dist/cjs/keypairs/ed25519';
import { getCoinPTB, parseSwapTransactionResult } from './utils';
import { Dex } from './types';
    
export { swapRoutePTB } from './lib';
export { getRoute } from './lib/retrieveAPI';
export { Dex, Router } from './types';

/**
 * Executes a swap transaction using the provided parameters.
 *
 * @param {string} address - The user's address.
 * @param {Transaction} txb - The transaction object.
 * @param {string} fromCoin - The coin to swap from.
 * @param {string} toCoin - The coin to swap to.
 * @param {TransactionResult} coin - The transaction result object.
 * @param {number | string | bigint} amountIn - The amount of the input coin.
 * @param {number} minAmountOut - The minimum amount of the output coin.
 * @param {Object} [swapOptions] - Optional swap options.
 * @param {Dex[]} [swapOptions.dexList] - List of DEXs to use.
 * @param {boolean} [swapOptions.byAmountIn] - Whether to swap by amount in.
 * @param {number} [swapOptions.depth] - The depth of the swap.
 * @returns {Promise<Transaction>} - The final transaction object.
 */
export async function swapPTB(
    address: string,
    txb: Transaction,
    fromCoin: string,
    toCoin: string,
    coin: TransactionResult,
    amountIn: number | string | bigint,
    minAmountOut: number,
    swapOptions: { dexList?: Dex[], byAmountIn?: boolean, depth?: number } = { dexList: [], byAmountIn: true, depth: 3 }
): Promise<Transaction> {

    // Get the output coin from the swap route and transfer it to the user
    const router = await import('./lib/retrieveAPI').then(module => module.getRoute(fromCoin, toCoin, amountIn, swapOptions));
    const finalCoinB = await import('./lib').then(module => module.swapRoutePTB(address, minAmountOut, txb, coin, router));
    txb.transferObjects([finalCoinB], address);

    return txb;
}


/**
 * Executes a swap transaction using the provided parameters.
 *
 * @param {string} address - The user's address.
 * @param {SuiClient} client - The Sui client instance.
 * @param {string} fromCoin - The coin to swap from.
 * @param {string} toCoin - The coin to swap to.
 * @param {number | string | bigint} amountIn - The amount of the input coin.
 * @param {number} minAmountOut - The minimum amount of the output coin.
 * @param {Object} [swapOptions] - Optional swap options.
 * @param {Dex[]} [swapOptions.dexList] - List of DEXs to use.
 * @param {boolean} [swapOptions.byAmountIn] - Whether to swap by amount in.
 * @param {number} [swapOptions.depth] - The depth of the swap.
 * @param {boolean} [swapOptions.isDryRun] - Whether to perform a dry run of the transaction.
 * @param {Ed25519Keypair} [swapOptions.keypair] - The keypair for signing the transaction.
 * @returns {Promise<Object>} - The transaction result or dry run result.
 * @throws {Error} - Throws an error if the keypair is not provided for signing and submitting the transaction.
 */
export async function swap(
    address: string,
    client: SuiClient,
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    minAmountOut: number,
    swapOptions: { dexList?: Dex[], byAmountIn?: boolean, depth?: number, isDryRun?: boolean, keypair?: Ed25519Keypair } = { dexList: [], byAmountIn: true, depth: 3, isDryRun: true, keypair: undefined }
) {
    const txb = new Transaction();
    txb.setSender(address);

    const coinA = await getCoinPTB(address, fromCoin, amountIn, txb, client);

    await swapPTB(address, txb, fromCoin, toCoin, coinA, amountIn, minAmountOut, swapOptions);

    if (swapOptions.isDryRun) {
        const dryRunTxBytes: Uint8Array = await txb.build({
            client: client
        });
        const response = await client.dryRunTransactionBlock({ transactionBlock: dryRunTxBytes });
        const { status, balanceChanges } = await parseSwapTransactionResult(response);

        return { status, balanceChanges };
    } else {
        if (swapOptions.keypair) {
            const response = await SignAndSubmitTXB(txb, client, swapOptions.keypair);
            return response;
        } else {
            throw new Error('Keypair is required for signing and submitting the transaction');
        }
    }
}
