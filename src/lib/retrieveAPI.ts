import axios from 'axios';
import { config } from '../config';
import { Router, SwapOptions } from '../types';


/**
 * Fetches the optimal swap route between two coins using the provided parameters.
 *
 * @param {string} fromCoin - The coin type to swap from.
 * @param {string} toCoin - The coin type to swap to.
 * @param {number | string | bigint} amountIn - The amount of the input coin to swap.
 * @param {SwapOptions} [swapOptions] - Optional parameters for the swap operation.
 * @returns {Promise<Router>} - Returns a promise that resolves to the router object containing swap routes.
 * @throws {Error} - Throws an error if the API base URL is not set or if no data is returned from the API.
 */
export async function getRoute(
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    swapOptions: SwapOptions = { referer: 'https://www.navi.ag/', dexList: [], byAmountIn: true, depth: 3 },
): Promise<Router> {
    if (!config.BASE_URL) {
        throw new Error("API base URL is not set");
    }

    // Construct query parameters for the API request
    const params = new URLSearchParams({
        from: fromCoin,
        target: toCoin,
        amount: (typeof amountIn === 'bigint' ? Number(amountIn) : amountIn).toString(),
        by_amount_in: swapOptions?.byAmountIn !== undefined ? swapOptions.byAmountIn.toString() : 'true',
        depth: swapOptions?.depth !== undefined ? swapOptions.depth.toString() : '3',
    }).toString();

    // Construct dex provider string if dexList is provided
    let dexString = '';
    if (swapOptions?.dexList && swapOptions.dexList.length > 0) {
        dexString = swapOptions.dexList.map(dex => `providers=${dex}`).join('&');
    }

    // Combine parameters and dexString for the full API request
    const fullParams = dexString ? `${params}&${dexString}` : params;

    try {
        // Make the API request to fetch the swap route
        const { data } = await axios.get(`${config.BASE_URL}?${fullParams}`, {
            headers: {
                'referer': swapOptions.referer
            }
        });

        if (!data) {
            throw new Error('No data returned from the API.');
        }

        // Set the from and target properties in the returned data
        data.data.from = fromCoin;
        data.data.target = toCoin;

        return data.data as Router;
    } catch (error: any) {
        console.error(`Error fetching routes from ${config.BASE_URL} with params ${JSON.stringify(params)}:`, error.message);
        throw error;
    }
}
