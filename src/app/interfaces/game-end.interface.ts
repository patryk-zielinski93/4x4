import { GameResult } from '../enums/game-result.enum';

export interface GameEnd {
  result: GameResult;
  winnerFields?: number[];
}
