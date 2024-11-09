# navi-aggregator-sdk
## [NAVI Aggregator for Sui Defi Ecosystem](https://navi.ag)

This TypeScript SDK simplifies integration with decentralized exchanges (DEXs) on the Sui blockchain, allowing developers to execute token swaps in Move-based PTB applications or directly leverage the SDK for optimized token swaps across multiple sources for the best prices.

For full details, please see the [Documentation](https://naviprotocol.gitbook.io/navi-protocol-docs/getting-started/navi-dex-aggregator).

## Supported DEX
* Cetus
* Turbos
* DeepBook v3
* Aftermath
* Kriya v2/v3

## Installation
```bash
npm i navi-aggregator-sdk
```

## Usage
* Get Quote

Pass in the fromCoin, toCoin, and amountIn. The output will be the quote for the swap.
```typescript
import { getRoute } from 'navi-aggregator-sdk';

const quote = await getRoute(fromCoin: string, toCoin: string, amountIn: number | string | bigint);
console.log(`Amount In: ${quote.amount_in}, Amount Out: ${quote.amount_out}`);
console.log(`Routes: ${quote.routes}`);
```
* Coin-In-Coin-Out PTB function

Pass in a coinObject as the coin parameter. The output will be the final coin object after the swap.
```typescript
import { swapPTB } from 'navi-aggregator-sdk';

const coinB = await swapPTB(
    address: string,
    txb: Transaction,
    fromCoin: string,
    toCoin: string,
    coin: TransactionResult,
    amountIn: number | string | bigint,
    minAmountOut: number,
    swapOptions: SwapOptions = { referer: 'https://www.navi.ag/', dexList: [], byAmountIn: true, depth: 3 }
)
```
* Swap function

The swap function is a wrapper for the getRoute and swapPTB functions. Set `isDryRun` from `swapOptions` to true to get a dry run result and balance changes. It will submit the transaction and return the result if a `keypair` is provided.
```typescript
import { swap } from 'navi-aggregator-sdk';

const result = await swap(
    address: string,
    client: SuiClient,
    fromCoin: string,
    toCoin: string,
    amountIn: number | string | bigint,
    minAmountOut: number,
    swapOptions: SwapOptions = { referer: 'https://www.navi.ag/', dexList: [], byAmountIn: true, depth: 3, isDryRun: true, keypair: undefined }
);
```

## Demo
See the [demo](sample/demo.ts) for examples of how to use the SDK with NAVI-SDK.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.