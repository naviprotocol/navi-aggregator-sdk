import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { config } from "../config";

export async function makeDeepbookPTB(txb: Transaction, poolId: string, coinA: any, amountLimit: any, a2b: boolean, typeArguments: any) {

    let baseCoin;
    let quoteCoin;

    const deepCoin = txb.moveCall({
        target: '0x2::coin::zero',
        typeArguments: [config.DEEPTOKEN_ADDRESS]
    })

    if (a2b) {
        baseCoin = coinA;
        quoteCoin = txb.moveCall({
            target: '0x2::coin::zero',
            typeArguments: [typeArguments[1]]
        })

    }
    else {
        baseCoin = txb.moveCall({
            target: '0x2::coin::zero',
            typeArguments: [typeArguments[0]]
        })
        quoteCoin = coinA;

    }

    const [baseCoinOut, quoteCoinOut, deepCoinOut] = txb.moveCall({
        target: `${config.DEEPBOOK_PACKAGEID}::pool::swap_exact_quantity`,
        arguments: [
            txb.object(poolId),
            baseCoin,
            quoteCoin,
            deepCoin,
            txb.pure.u64(amountLimit),
            txb.object(config.CLOCK_ADDRESS),
        ],
        typeArguments: typeArguments
    })

    return { baseCoinOut, quoteCoinOut, deepCoinOut };
}