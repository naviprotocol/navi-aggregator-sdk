import { returnMergedCoins, SignAndSubmitTXB } from 'navi-sdk/dist/libs/PTB';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/dist/cjs/client';
import { Ed25519Keypair } from '@mysten/sui/dist/cjs/keypairs/ed25519';
import { getCoinPTB, parseSwapTransactionResult } from './utils';
import { Dex, SwapOptions } from './types';
    
export { swapRoutePTB } from './lib';
export { getRoute } from './lib/retrieveAPI';
export { Dex, Router, SwapOptions } from './types';


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
 * @param {SwapOptions} [swapOptions] - Optional swap options.
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
    swapOptions: SwapOptions = { dexList: [], byAmountIn: true, depth: 3 }
): Promise<Transaction> {

    // Get the output coin from the swap route and transfer it to the user
    const router = await import('./lib/retrieveAPI').then(module => module.getRoute(fromCoin, toCoin, amountIn, swapOptions));
    const finalCoinB = await import('./lib').then(module => module.swapRoutePTB(address, minAmountOut, txb, coin, router));
    txb.transferObjects([finalCoinB], address);

    return txb;
}



/**
 * Executes a swap operation between two coins.
 *
 * @param {string} address - The user's address initiating the swap.
 * @param {SuiClient} client - The Sui client instance for blockchain interaction.
 * @param {string} fromCoin - The coin type to swap from.
 * @param {string} toCoin - The coin type to swap to.
 * @param {number | string | bigint} amountIn - The amount of the input coin to swap.
 * @param {number} minAmountOut - The minimum acceptable amount of the output coin.
 * @param {SwapOptions} [swapOptions] - Optional parameters for the swap operation.
 * @returns {Promise<Object>} - Returns a promise that resolves to the transaction result or dry run result.
 * @throws {Error} - Throws an error if keypair is not provided for non-dry run transactions.
 */
export async function swap(
    address: string,
    client: SuiClient,
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    minAmountOut: number,
    swapOptions: SwapOptions = { dexList: [], byAmountIn: true, depth: 3, isDryRun: true, keypair: undefined }
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
