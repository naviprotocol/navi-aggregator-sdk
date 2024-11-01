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
