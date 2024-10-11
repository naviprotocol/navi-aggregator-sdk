import { Transaction } from "@mysten/sui/transactions";
import { config } from "../config";



export async function makeCETUSPTB(txb: Transaction, poolId: string, byAmountIn: boolean, coinA: any, amount: any, a2b: boolean, typeArguments: any) {


    let coinTypeA = typeArguments[0];
    let coinTypeB = typeArguments[1];

    const sqrtPriceLimit = BigInt(a2b ? '4295048016' : '79226673515401279992447579055')

    const [cetusReceiveA, cetusReceiveB, cetusflashReceipt] = txb.moveCall({
        target: `${config.CETUSPackageID}::pool::flash_swap`,
        arguments: [
            txb.object(config.CETUSConfigID),
            txb.object(poolId),
            txb.pure.bool(a2b),
            txb.pure.bool(byAmountIn),
            amount,
            txb.pure.u128(sqrtPriceLimit),
            txb.object('0x6')
        ],
        typeArguments: [coinTypeA, coinTypeB]
    })
    txb.moveCall({
        target: `${config.CETUSPackageID}::pool::swap_pay_amount`,
        arguments: [cetusflashReceipt],
        typeArguments: [coinTypeA, coinTypeB]
    })

    if (a2b) {
        const pay_coin_b = txb.moveCall({
            target: '0x2::balance::zero',
            typeArguments: [coinTypeB]
        })

        txb.moveCall({
            target: `${config.CETUSPackageID}::pool::repay_flash_swap`,
            arguments: [
                txb.object(config.CETUSConfigID),
                txb.object(poolId),
                coinA,
                pay_coin_b,
                cetusflashReceipt
            ],
            typeArguments: [coinTypeA, coinTypeB]
        })

        const coin_a = txb.moveCall({
            target: `0x2::coin::from_balance`,
            arguments: [cetusReceiveA],
            typeArguments: [coinTypeA]
        })
        const receive_coin_b = txb.moveCall({
            target: `0x2::coin::from_balance`,
            arguments: [cetusReceiveB],
            typeArguments: [coinTypeB]
        })

        return { swappedToken: receive_coin_b, coinleft: coin_a }
    }

    const [pay_coin_a] = txb.moveCall({
        target: '0x2::balance::zero',
        typeArguments: [coinTypeA]
    })

    txb.moveCall({
        target: `${config.CETUSPackageID}::pool::repay_flash_swap`,
        arguments: [
            txb.object(config.CETUSConfigID),
            txb.object(poolId),
            pay_coin_a,
            coinA,
            cetusflashReceipt
        ],
        typeArguments: [coinTypeA, coinTypeB]
    })

    const leftCoinB: any = txb.moveCall({
        target: `0x2::coin::from_balance`,
        arguments: [cetusReceiveB],
        typeArguments: [coinTypeB]
    })
    const receiveACoin: any = txb.moveCall({
        target: `0x2::coin::from_balance`,
        arguments: [cetusReceiveA],
        typeArguments: [coinTypeA]
    })

    return { receiveACoin, leftCoinB }

}