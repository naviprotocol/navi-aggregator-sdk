import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();
export const BASE_URL = process.env.apiBaseURL || undefined;


export async function getRoutes(
    tokenA: string,
    tokenB: string,
    amount: number,
    byAmountIn = true,
    depth = 3,
    providers = 'cetus'
) {
    if (!BASE_URL) {
        throw new Error("API base URL is not set");
    }
    const params = {
        from: tokenA,
        target: tokenB,
        amount: amount.toString(),
        by_amount_in: byAmountIn,
        depth,
        providers
    };

    try {
        const { data } = await axios.get(BASE_URL, { params });

        if (!data) {
            throw new Error('No data returned from the API.');
        }

        return data;
    } catch (error: any) {
        console.error(`Error fetching routes from ${BASE_URL} with params ${JSON.stringify(params)}:`, error.message);
        throw error;
    }
}