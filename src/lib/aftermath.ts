import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { config } from "../config";

export async function makeAftermathPTB(txb: Transaction, poolId: string, coinA: any, amountOut: any, a2b: boolean, typeArguments: any) {

    const args = [
        txb.object(poolId),
        txb.object(config.AFTERMATH_POOLREGISTRY),
        txb.object(config.AFTERMATH_FEEVAULT),
        txb.object(config.AFTERMATH_TREASURY),
        txb.object(config.AFTERMATH_INSURANCE_FUND),
        txb.object(config.AFTERMATH_REFERRAL_VAULT),
        coinA,
        txb.pure.u64(amountOut),
        txb.pure.u64('800000000000000000'), // 80%， use https://suivision.xyz/txblock/AvASModFbU6Bmu6FNghqBsVqktnhB9QZKQjdYfnuxNvo?tab=Overview as an reference
    ]

    const res = txb.moveCall({
        target: `${config.AFTERMATH_PACKAGEID}::swap::swap_exact_in`,
        typeArguments: typeArguments,
        arguments: args,
    })

    return res
}