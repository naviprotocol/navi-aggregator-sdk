import { returnMergedCoins, SignAndSubmitTXB } from 'navi-sdk/dist/libs/PTB';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { getRoutePTBWithCoin, getCoins } from './lib';
import { SuiClient } from '@mysten/sui/dist/cjs/client';

/**
 * Prepares a transaction for swapping a specified amount of tokenA to tokenB by fetching the route
 * and handling coin splits or merges when necessary.
 *
 * @param client - The SuiClient instance for blockchain interaction.
 * @param txb - The Transaction object for building the swap transaction.
 * @param userAddress - The address of the user initiating the transaction.
 * @param tokenA - The first token address in the pair (token to be swapped).
 * @param tokenB - The second token address in the pair (token to receive).
 * @param amountIn - The amount of tokenA to be swapped.
 * @param slippage - The acceptable slippage percentage for the swap.
 * @returns A promise that resolves to the updated Transaction object.
 * @throws Will throw an error if the user has insufficient balance for tokenA.
 */
export async function getRoutePTB(
    client: SuiClient,
    txb: Transaction,
    userAddress: string,
    tokenA: string,
    tokenB: string,
    amountIn: number,
    minAmountOut: number
): Promise<Transaction> {
    let coinA: TransactionResult;

    // Handle the case where the token is native SUI
    if (tokenA === '0x2::sui::SUI') {
        coinA = txb.splitCoins(txb.gas, [txb.pure.u64(amountIn)]);
    } else {
        const coinInfo = await getCoins(client, userAddress, tokenA);

        // Check if user has enough balance for tokenA
        if (!coinInfo.data[0]) {
            throw new Error('Insufficient balance for this coin');
        }

        // Merge coins if necessary, to cover the amount needed
        const mergedCoin = returnMergedCoins(txb, coinInfo);
        coinA = txb.splitCoins(mergedCoin, [txb.pure.u64(amountIn)]);
    }

    // Get the output coin from the swap route and transfer it to the user
    const finalCoinB = await getRoutePTBWithCoin(txb, tokenA, tokenB, coinA, amountIn, minAmountOut, userAddress);
    txb.transferObjects([finalCoinB], userAddress);

    return txb;
}
