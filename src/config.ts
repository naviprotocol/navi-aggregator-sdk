import * as dotenv from "dotenv";

dotenv.config();

export let BASE_URL = process.env.NAVI_DEX_AGGREGATOR_API_BASE_URL || "";

export const updateURL = (newBaseUrl: string): void => {
    BASE_URL = newBaseUrl;
};

export const config = {
    BASE_URL,
    AGGREGATORCONTRACT: "0x88dfe5e893bc9fa984d121e4d0d5b2e873dc70ae430cf5b3228ae6cb199cb32b",
    CETUSPACKAGEID: "0x70968826ad1b4ba895753f634b0aea68d0672908ca1075a2abdf0fc9e0b2fc6a",
    CETUSCONFIGID: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    TURBOSPACKAGEID: "0x1a3c42ded7b75cdf4ebc7c7b7da9d1e1db49f16fcdca934fac003f35f39ecad9"
};
