import { DryRunTransactionBlockResponse, SuiClient } from "@mysten/sui/dist/cjs/client";
import { TransactionResult } from "@mysten/sui/transactions";
import { Transaction } from "@mysten/sui/transactions";
import { returnMergedCoins } from "navi-sdk/dist/libs/PTB";


export async function getCoins(
    client: SuiClient,
    address: string,
    coinType: any = "0x2::sui::SUI"
  ) {
    const coinAddress = coinType.address ? coinType.address : coinType;
  
    const coinDetails = await client.getCoins({
      owner: address,
      coinType: coinAddress,
    });
    return coinDetails;
  }
  
export async function getCoinPTB(address: string, coin: string, amountIn: number | string | bigint, txb: Transaction, client: SuiClient) {
    let coinA: TransactionResult;

    if (coin === '0x2::sui::SUI') {
        coinA = txb.splitCoins(txb.gas, [txb.pure.u64(amountIn)]);
    } else {
        const coinInfo = await getCoins(client, address, coin);

        // Check if user has enough balance for tokenA
        if (!coinInfo.data[0]) {
            throw new Error('Insufficient balance for this coin');
        }

        // Merge coins if necessary, to cover the amount needed
        const mergedCoin = returnMergedCoins(txb, coinInfo);
        coinA = txb.splitCoins(mergedCoin, [txb.pure.u64(amountIn)]);
    }
    return coinA;
}

export async function parseSwapTransactionResult(result: DryRunTransactionBlockResponse) {
    const status = result.effects.status.status;
    const balanceChanges = result.balanceChanges;

    return { status, balanceChanges };
}
