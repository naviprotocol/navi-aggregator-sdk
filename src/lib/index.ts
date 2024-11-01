import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { makeCETUSPTB } from "./cetus";
import { makeTurbosPTB } from "./turbos";
import { config } from "../config";
import { Router } from "../types";
import { makeKriyaV3PTB } from "./kriyaV3";
import { makeAftermathPTB } from "./aftermath";
import { makeKriyaV2PTB } from "./KriyaV2";


/**
 * Executes a swap route using the provided parameters.
 *
 * @param {string} userAddress - The user's address.
 * @param {number} minAmountOut - The minimum amount of the output coin.
 * @param {Transaction} txb - The transaction object.
 * @param {TransactionResult} coinIn - The input coin transaction result.
 * @param {Router} router - The router object containing swap routes.
 * @returns {Promise<TransactionResult>} - The final output coin transaction result.
 * @throws {Error} - Throws an error if no routes are found or if the outer amount_in does not match the sum of route amount_in values.
 */
export async function swapRoutePTB(userAddress: string, minAmountOut: number, txb: Transaction, coinIn: TransactionResult, router: Router): Promise<TransactionResult> {
  if (!router.routes || router.routes.length === 0) {
    throw new Error("No routes found in data");
  }
  const tokenA = router.from;
  const tokenB = router.target;
  const referral = 0;
  const allPaths = JSON.parse(JSON.stringify(router.routes));
  console.log(`tokenA: ${tokenA}, tokenB: ${tokenB}`);
  if (
    Number(router.amount_in) !==
    router.routes.reduce(
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
      const amountOut = route.amount_out;

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
      else if (provider === "kriyaV2") {
        pathTempCoin = await makeKriyaV2PTB(txb, poolId, true, pathTempCoin, amountInPTB, a2b, typeArguments)
      }
      else if (provider === "kriyaV3") {
        pathTempCoin = await makeKriyaV3PTB(txb, poolId, true, pathTempCoin, amountInPTB, a2b, typeArguments)
      }
      else if (provider === "aftermath") {
        pathTempCoin = await makeAftermathPTB(txb, poolId, pathTempCoin, amountOut, a2b, typeArguments)
      }

    }

    txb.mergeCoins(finalCoinB, [pathTempCoin]);
  }

  txb.transferObjects([coinIn], userAddress);

  txb.moveCall({
    target: `${config.AGGREGATORCONTRACT}::slippage::check_slippage_v2`,
    arguments: [
      finalCoinB, // output coin object
      txb.pure.u64(Math.floor(minAmountOut)), // min amount out
      txb.pure.u64(router.amount_in), // amount in
      txb.pure.u64(referral), // refferal id
    ],
    typeArguments: [tokenA, tokenB],
  });

  return finalCoinB;
}