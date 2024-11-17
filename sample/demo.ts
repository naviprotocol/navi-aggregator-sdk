import { NAVISDKClient } from "navi-sdk";
import { CoinInfo } from "navi-sdk/dist/types";
import { wUSDC, nUSDC, USDT, NAVX } from "navi-sdk/dist/address";
import { getRoute, swap, SwapOptions } from "navi-aggregator-sdk";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from the .env file

// Example configuration for meme coins (add as needed)
const HIPPO: CoinInfo = {
    symbol: "HIPPO",
    address: "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG",
    decimal: 9
}

// Configuration for the swap operation
const CONFIG: {
    mnemonic: string | undefined;
    networkType: string;
    numberOfAccounts: number;
    fromCoin: CoinInfo;
    toCoin: CoinInfo;
    amountToSwap: number;
    slippage: number;
    isTrueSwap: boolean;
} = {
    mnemonic: process.env.mnemonic, // Fetch mnemonic from environment variables
    networkType: "mainnet", // Default network type
    numberOfAccounts: 1, // Initialize one account
    fromCoin: nUSDC, // Source coin for the swap (e.g wUSDC, nUSDC, USDT, NAVX)
    toCoin: NAVX, // Target coin for the swap
    amountToSwap: 1, // Amount to swap (e.g., 1 nUSDC)
    slippage: 0.001, // 0.1% slippage tolerance (e.g 0.3% 0.5% 1%)
    isTrueSwap: false, // Set to true for an actual swap
};

// Default options for the swap operation
let swapOptions: SwapOptions = {
    referer: "https://www.navi.ag/", // Referer URL
    dexList: [], // List of decentralized exchanges (default: empty)
    byAmountIn: true, // Use input amount to determine swap
    depth: 3, // Depth of routing search
    isDryRun: true, // Perform a dry run (simulation)
    keypair: undefined, // Keypair for authentication (set later)
};

// Check if mnemonic is defined; if not, throw an error
if (!CONFIG.mnemonic) {
    throw new Error("Mnemonic is not defined in environment variables.");
}

// Example: RPC = 'https://sui-mainnet-endpoint.blockvision.org'
if (!process.env.RPC) {
    throw new Error("RPC endpoint is not defined in environment variables. Please set the 'RPC' value in the .env file.");
}

// Example: NAVI_DEX_AGGREGATOR_API_BASE_URL = 'https://aggregator-api.naviprotocol.io/find_routes'
if (!process.env.NAVI_DEX_AGGREGATOR_API_BASE_URL) {
    throw new Error("NAVI_DEX_AGGREGATOR_API_BASE_URL is not defined in environment variables. Please set the 'NAVI_DEX_AGGREGATOR_API_BASE_URL' value in the .env file.");
}

// Initialize the NAVISDKClient with the provided configuration
const client = new NAVISDKClient({
    mnemonic: CONFIG.mnemonic!,
    networkType: CONFIG.networkType,
    numberOfAccounts: CONFIG.numberOfAccounts,
});

/**
 * Executes a token swap using the configured parameters.
 */
async function executeSwap() {
    const account = client.accounts[0]; // Retrieve the first account
    const sender = account.address; // Get the sender's address

    console.log("Sender Address:", sender);

    // Update swap options if performing a real swap
    if (CONFIG.isTrueSwap) {
        swapOptions = { ...swapOptions, isDryRun: false, keypair: account.keypair };
    }

    // Convert the swap amount to Wei (smallest unit of the coin)
    const swapAmountInWei = CONFIG.amountToSwap * 10 ** CONFIG.fromCoin.decimal;

    // If the swap involves large numbers or requires high precision, use BigInt or libraries like bignumber.js to handle it.

    // const swapAmountInWei = BigInt(CONFIG.amountToSwap) * BigInt(10 ** CONFIG.fromCoin.decimal);
    // console.log("Swap Amount in Wei:", swapAmountInWei.toString());

    // Fetch routing data for the swap
    const routeData = await getRoute(
        CONFIG.fromCoin.address,
        CONFIG.toCoin.address,
        swapAmountInWei
    );

    console.log("Route Data:", routeData);
    console.log("Input Amount (Wei):", routeData.amount_in);
    console.log("Output Amount (Wei):", routeData.amount_out);

    // Calculate the minimum acceptable output amount after slippage
    const minAmountOut = Number(routeData.amount_out) * (1 - CONFIG.slippage);
    console.log("Minimum Output Amount (after slippage):", minAmountOut);

    // If the swap involves large numbers or requires high precision, use BigInt or libraries like bignumber.js to handle it.

    // const minAmountOut = BigInt(routeData.amount_out) * BigInt((1 - CONFIG.slippage) * 1e6) / BigInt(1e6);
    // console.log("Minimum Output Amount (after slippage):", minAmountOut.toString());

    try {
        // Execute the swap transaction
        const result = await swap(
            account.address,
            account.client,
            CONFIG.fromCoin.address,
            CONFIG.toCoin.address,
            swapAmountInWei,
            minAmountOut,
            swapOptions
        );
        console.log("Transaction Result:", result);
    } catch (error: any) {
        if (error instanceof Error && error.message.includes("check_slippage_v2")) {
            console.error("Slippage check failed. Adjust your slippage tolerance.");
        } else {
            console.error("Unexpected Error:", error);
        }
    }
}

// Main function to execute the swap script
(async () => {
    await executeSwap();
})();
