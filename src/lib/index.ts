import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { getRoutes } from "./retrieveAPI";
import { SuiClient } from "@mysten/sui/dist/cjs/client";
import { makeCETUSPTB } from "./cetus";
import { makeTurbosPTB } from "./turbos";
import { config } from "../config";

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

export async function getRoutePTBWithCoin(
  txb: Transaction,
  tokenA: string,
  tokenB: string,
  coinIn: TransactionResult,
  amountIn: number,
  minAmountOut: number,
  userAddress: string
) {
  const data = await getRoutes(tokenA, tokenB, amountIn);
  const allPaths = JSON.parse(JSON.stringify(data.data.routes));
  const referral = 0;
  if (!data.data.routes || data.data.routes.length === 0) {
    throw new Error("No routes found in data");
  }

  if (
    Number(data.data.amount_in) !==
    data.data.routes.reduce(
      (sum: number, route: any) => sum + Number(route.amount_in),
      0
    )
  ) {
    throw new Error(
      "Outer amount_in does not match the sum of route amount_in values"
    );
  }

  const finalCoinB = txb.moveCall({
    target: "0x2::coin::zero",
    typeArguments: [tokenB],
  });

  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];
    const pathCoinAmountIn = Math.floor(path.amount_in);
    const pathCoinAmountOut = path.amount_out;
    console.log(
      `Path Index: `,
      i,
      `Amount In: `,
      pathCoinAmountIn,
      `Expected Amount Out: `,
      pathCoinAmountOut
    );
    let pathTempCoin: any = txb.splitCoins(coinIn, [pathCoinAmountIn]);

    for (let j = 0; j < path.path.length; j++) {
      const route = path.path[j];

      const poolId = route.id;
      const provider = route.provider;
      const tempTokenA = route.from;
      const tempTokenB = route.target;
      const a2b = route.a2b;
      const typeArguments = route.info_for_ptb.typeArguments;

      let amountInPTB;
      let tuborsVersion;

      if (provider === "turbos") {
        tuborsVersion = route.info_for_ptb.contractVersionId;
      }
      console.log(
        `Route Index: `,
        i,
        "-",
        j,
        `provider: `,
        provider,
        `from: `,
        tempTokenA,
        `to: `,
        tempTokenB
      );

      amountInPTB = txb.moveCall({
        target: "0x2::coin::value",
        arguments: [pathTempCoin],
        typeArguments: [tempTokenA],
      });

      if (provider === "cetus") {
        let toSwapBalance = txb.moveCall({
          target: "0x2::coin::into_balance",
          arguments: [pathTempCoin],
          typeArguments: [tempTokenA],
        });
        const { receiveCoin, leftCoin } = await makeCETUSPTB(
          txb,
          poolId,
          true,
          toSwapBalance,
          amountInPTB,
          a2b,
          typeArguments
        );

        txb.transferObjects([leftCoin], userAddress);
        pathTempCoin = receiveCoin;
      } else if (provider === "turbos") {
        pathTempCoin = txb.makeMoveVec({
          elements: [pathTempCoin!],
        });
        const { turbosCoinB, turbosCoinA } = await makeTurbosPTB(
          txb,
          poolId,
          true,
          pathTempCoin,
          amountInPTB,
          a2b,
          typeArguments,
          userAddress,
          tuborsVersion
        );
        txb.transferObjects([turbosCoinA], userAddress);
        pathTempCoin = turbosCoinB;
      }
    }

    txb.mergeCoins(finalCoinB, [pathTempCoin]);
  }

  txb.transferObjects([coinIn], userAddress);

  txb.moveCall({
    target: `${config.AGGREGATORCONTRACT}::slippage::check_slippage_v2`,
    arguments: [
      finalCoinB, // output coin object
      txb.pure.u64(minAmountOut), // min amount out
      txb.pure.u64(amountIn), // amount in
      txb.pure.u64(referral), // refferal id
    ],
    typeArguments: [tokenA, tokenB],
  });

  return finalCoinB;
}
