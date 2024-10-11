import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { getRoutes } from "./retrieveAPI";
import { SuiClient } from "@mysten/sui/dist/cjs/client";
import { makeCETUSPTB } from "./cetus";
import { makeTurbosPTB } from "./turbos";
import { config } from "../config";

export async function getCoins(client: SuiClient, address: string, coinType: any = "0x2::sui::SUI") {
    const coinAddress = coinType.address ? coinType.address : coinType;

    const coinDetails = await client.getCoins({
        owner: address,
        coinType: coinAddress
    });
    return coinDetails;
}

export async function getRoutePTBWithCoin(txb: Transaction, tokenA: string, tokenB: string, coinIn: TransactionResult, amountIn: number, minAmountOut: number, userAddress: string) {

    const data = await getRoutes(tokenA, tokenB, amountIn);
    const routerSui = JSON.parse(JSON.stringify(data.data.routes));

    const referral = 0;
    let currentCoin: any = coinIn;

    for (let i = 0; i < routerSui.length; i++) {
        const path = routerSui[i];

        for (let j = 0; j < path.path.length; j++) {
            const route = path.path[j];

            const poolId = route.id;
            const provider = route.provider;
            const tokenA = route.from;
            const tokenB = route.target;
            const a2b = route.a2b;
            const typeArguments = route.info_for_ptb.typeArguments;

            let amountInPTB;
            let tuborsVersion;

            if (provider === 'turbos') {
                tuborsVersion = route.info_for_ptb.contractVersionId;
            }
            console.log(`Route Index: `, j, `provider: `, provider, `from: `, tokenA, `to: `, tokenB)

            amountInPTB = txb.moveCall({
                target: '0x2::coin::value',
                arguments: [currentCoin],
                typeArguments: [tokenA]
            });

            if (provider === 'cetus') {
                let toSwapBalance = txb.moveCall({
                    target: '0x2::coin::into_balance',
                    arguments: [currentCoin],
                    typeArguments: [tokenA],
                });
                const { receiveACoin, leftCoinB } = await makeCETUSPTB(txb, poolId, true, toSwapBalance, amountInPTB, a2b, typeArguments);

                txb.transferObjects([leftCoinB], userAddress);
                currentCoin = receiveACoin;
            } else if (provider === 'turbos') {
                currentCoin = txb.makeMoveVec({
                    elements: [currentCoin!],
                });
                const { turbosCoinB, turbosCoinA } = await makeTurbosPTB(txb, poolId, true, currentCoin, amountInPTB, a2b, typeArguments, userAddress, tuborsVersion);
                txb.transferObjects([turbosCoinA], userAddress);
                currentCoin = turbosCoinB;
            }
        }
    }

    txb.moveCall({
        target: `${config.AGGREGATORCONTRACT}::slippage::check_slippage_v2`,
        arguments: [
            currentCoin, // output coin object
            txb.pure.u64(minAmountOut), // min amount out
            txb.pure.u64(amountIn), // amount in
            txb.pure.u64(referral) // refferal id
        ],
        typeArguments: [tokenA, tokenB],
    })

    return currentCoin;
}