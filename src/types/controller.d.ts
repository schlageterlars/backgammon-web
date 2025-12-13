declare module "@/assets/backgammon-opt.min.js" {
  export const ControllerJS: {
    init(): void;
    getCurrentPlayer(): string;
    getBarWhite(): number;
    getBarBlack(): number;
    getFields(): number[];
    getDice(): number[];
    doMove(from: number, to: number): void;
  };
}