import axios from 'axios';
import { config } from '../config';
import { Router } from '../types';

/**
 * Fetches the swap route from the API based on the provided parameters.
 *
 * @param {string} fromCoin - The coin type to swap from.
 * @param {string} toCoin - The coin type to swap to.
 * @param {number | string | bigint} amountIn - The amount of the input coin.
 * @param {Object} [swapOptions] - Optional swap options.
 * @param {string[]} [swapOptions.dexList] - List of DEX providers to use.
 * @param {boolean} [swapOptions.byAmountIn=true] - Whether to swap by amount in.
 * @param {number} [swapOptions.depth=3] - The depth of the swap route.
 * @returns {Promise<Router>} - The swap route information.
 * @throws {Error} - Throws an error if the API base URL is not set or if the API call fails.
 */
export async function getRoute(
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    swapOptions: { dexList?: string[], byAmountIn?: boolean, depth?: number } = { dexList: ['cetus'], byAmountIn: true, depth: 3 }
): Promise<Router> {
    if (!config.BASE_URL) {
        throw new Error("API base URL is not set");
    }
    const params = {
        from: fromCoin,
        target: toCoin,
        amount: (typeof amountIn === 'bigint' ? Number(amountIn) : amountIn).toString(),
        by_amount_in: swapOptions?.byAmountIn !== undefined ? swapOptions.byAmountIn : true,
        depth: swapOptions?.depth !== undefined ? swapOptions.depth : 3,
        providers: swapOptions?.dexList && swapOptions.dexList.length > 0 ? swapOptions.dexList.join(',') : undefined
    };

    try {
        const { data } = await axios.get(config.BASE_URL, { params });

        if (!data) {
            throw new Error('No data returned from the API.');
        }
        data.data.from = fromCoin;
        data.data.target = toCoin;

        return data.data as Router;
    } catch (error: any) {
        console.error(`Error fetching routes from ${config.BASE_URL} with params ${JSON.stringify(params)}:`, error.message);
        throw error;
    }
}
