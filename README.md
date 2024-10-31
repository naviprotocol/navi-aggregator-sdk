# navi-aggregator-sdk
*NAVI Aggregator for Sui Defi Ecosystem*

This project provides a TypeScript SDK for interacting with the Sui Defi projects, allowing developers to integrate token swap functionalities, manage transactions, and interact with the blockchain using NAVI's aggregator.

## Supported DEX
* CETUS
* Turbos
* DeepBook v2/v3

To be added:
* Aftermath
* Kriya v2/v3

## Installation
```bash
npm i navi-aggregator-sdk
```

## Environment Setup
Ensure you have a .env file set up with the following variables:

```bash
MNEMONIC=<your_wallet_mnemonic>
RPC=<your_sui_rpc_url>
apiBaseURL = <api_url>
```

## Usage
Explanation of Parameters:
 * Executes a swap transaction using the provided parameters.
 *
 * @param {string} address - The user's address.
 * @param {SuiClient} client - The Sui client instance.
 * @param {string} fromCoin - The coin to swap from.
 * @param {string} toCoin - The coin to swap to.
 * @param {number | string | bigint} amountIn - The amount of the input coin.
 * @param {number} minAmountOut - The minimum amount of the output coin.
 * @param {boolean} [isDryRun=true] - Whether to perform a dry run of the transaction.
 * @param {Ed25519Keypair} [keypair] - The keypair for signing the transaction.
 * @param {Object} [swapOptions] - Optional swap options.
 * @param {string[]} [swapOptions.dexList] - List of DEXs to use.
 * @param {boolean} [swapOptions.byAmountIn] - Whether to swap by amount in.
 * @param {number} [swapOptions.depth] - The depth of the swap.
 * @throws {Error} - Throws an error if keypair is not provided for non-dry run transactions.

```Typescript
export async function swap(
    address: string,
    client: SuiClient,
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    minAmountOut: number,
    isDryRun: boolean = true,
    keypair?: Ed25519Keypair,
    swapOptions: { dexList?: string[], byAmountIn?: boolean, depth?: number } = { dexList: ['cetus'], byAmountIn: true, depth: 3 }
)
```