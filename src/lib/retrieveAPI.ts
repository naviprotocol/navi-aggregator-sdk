import axios from 'axios';
import { config } from '../config';

export async function getRoutes(
    tokenA: string,
    tokenB: string,
    amount: number,
    providers: string[],
    byAmountIn = true,
    depth = 3
) {
    if (!config.BASE_URL) {
        throw new Error("API base URL is not set");
    }
    const params = {
        from: tokenA,
        target: tokenB,
        amount: amount.toString(),
        by_amount_in: byAmountIn,
        depth,
        providers: providers.length > 0 ? providers.join(',') : undefined
    };

    try {
        const { data } = await axios.get(config.BASE_URL, { params });

        if (!data) {
            throw new Error('No data returned from the API.');
        }

        return data;
    } catch (error: any) {
        console.error(`Error fetching routes from ${config.BASE_URL} with params ${JSON.stringify(params)}:`, error.message);
        throw error;
    }
}