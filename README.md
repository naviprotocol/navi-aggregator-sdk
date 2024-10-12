# navi-aggregator-sdk
*NAVI Aggregator for Sui Defi Ecosystem*

This project provides a TypeScript SDK for interacting with the Sui Defi projects, allowing developers to integrate token swap functionalities, manage transactions, and interact with the blockchain using NAVI's aggregator.

## Supported DEX
* CETUS
* Turbos
* DeepBook v2/v3

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
* client: Instance of SuiClient that connects to the SUI blockchain.
* txb: Transaction object used to build and execute the swap.
* userAddress: The address of the user initiating the transaction.
* tokenA: Address of the token being swapped from.
* tokenB: Address of the token being swapped to.
* amountIn: The amount of tokenA to swap.
* minAmountOut: Acceptable Minmium to Receive.

```Typescript
import {getRoutePTB} from 'navi-aggregator-sdk/dist/src';

export async function getRoutePTB(client: SuiClient, txb: Transaction, userAddress: string, tokenA: string, tokenB: string, amountIn: number, minAmountOut: number): Transaction
```