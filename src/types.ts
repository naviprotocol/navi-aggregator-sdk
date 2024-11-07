import { Ed25519Keypair } from '@mysten/sui/dist/cjs/keypairs/ed25519';

export enum Dex {
    Cetus = 'cetus',
    Turbos = 'turbos',
    KriyaV2 = 'kriyaV2',
    KriyaV3 = 'kriyaV3',
    Aftermath = 'aftermath'
}

export type Router = {
    routes: any[];
    amount_in: string;
    amount_out: string;
    from: string;
    target: string;
    dexList: Dex[];
}

export type SwapOptions = {
    dexList?: Dex[];
    byAmountIn?: boolean;
    depth?: number;
    isDryRun?: boolean;
    keypair?: Ed25519Keypair;
};
