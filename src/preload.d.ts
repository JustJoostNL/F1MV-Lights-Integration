import { f1mvli } from "../electron/preload";
export {};
declare global {
    interface Window {
        f1mvli: typeof f1mvli;
    }
}