export enum Dex {
    Cetus = 'cetus',
    Turbos = 'turbos',
    Kriya = 'kriya',
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
