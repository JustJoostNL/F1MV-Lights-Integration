import { f1mvli } from "../preload/preload";
export {};
declare global {
  interface Window {
    f1mvli: typeof f1mvli;
  }
}
