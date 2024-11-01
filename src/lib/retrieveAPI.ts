import axios from 'axios';
import { config } from '../config';
import { Router } from '../types';
import { Dex } from '../types';

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
    swapOptions: { dexList?: Dex[], byAmountIn?: boolean, depth?: number } = { dexList: [Dex.Cetus], byAmountIn: true, depth: 3 }
): Promise<Router> {
    if (!config.BASE_URL) {
        throw new Error("API base URL is not set");
    }
    const params = new URLSearchParams({
        from: fromCoin,
        target: toCoin,
        amount: (typeof amountIn === 'bigint' ? Number(amountIn) : amountIn).toString(),
        by_amount_in: swapOptions?.byAmountIn !== undefined ? swapOptions.byAmountIn.toString() : 'true',
        depth: swapOptions?.depth !== undefined ? swapOptions.depth.toString() : '3',
    }).toString();
    let dexString = '';
    if (swapOptions?.dexList && swapOptions.dexList.length > 0) {
        dexString = swapOptions.dexList.map(dex => `providers=${dex}`).join('&');
    }
    
    const fullParams = dexString ? `${params}&${dexString}` : params;
    try {
        const { data } = await axios.get(`${config.BASE_URL}?${fullParams}`);

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
