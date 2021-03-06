import { Injectable } from '@angular/core';
import { PlayerSymbol } from '../enums/player-symbol.enum';

@Injectable({providedIn: 'root'})
export class WinService {
  private fields: string[];
  private winnerFiledIndexes: number[];

  checkTie(fields: string[]): boolean {
    return fields.every(val => val !== '');
  }

  checkWin(fields: string[]): number[] {
    this.fields = fields;
    this.winnerFiledIndexes = [];

    this.checkThree(1, 1);
    this.checkThree(5, 1);
    this.checkThree(9, 1);
    this.checkThree(13, 1);
    this.checkThree(4, 4);
    this.checkThree(5, 4);
    this.checkThree(6, 4);
    this.checkThree(7, 4);
    this.checkThree(5, 5);
    this.checkThree(6, 3);

    return this.winnerFiledIndexes;
  }

  checkWinForPlayer(fields: string[], playerSymbol: PlayerSymbol): boolean {
    const HEIGHT = 4;
    const WIDTH = 4;
    let count: number;

    // check horizontals
    for (let i = 0; i < HEIGHT; i++) {
      count = 0;
      for (let j = 0; j < WIDTH; j++) {
        if (fields[this.getPositionForMove(j, i)] === playerSymbol) {
          count++;
        }
      }

      if (count === WIDTH) {
        return true;
      }
    }

    // check verticals
    for (let i = 0; i < WIDTH; i++) {
      count = 0;
      for (let j = 0; j < HEIGHT; j++) {
        if (fields[this.getPositionForMove(i, j)] === playerSymbol) {
          count++;
        }
      }

      if (count === WIDTH) {
        return true;
      }
    }

    // check horizontals
    count = 0;
    for (let i = 0; i < HEIGHT; i++) {
      if (fields[this.getPositionForMove(i, i)] === playerSymbol) {
        count++;
      }
    }
    if (count === HEIGHT) {
      return true;
    }

    count = 0;
    for (let i = 0; i < HEIGHT; i++) {
      if (fields[this.getPositionForMove(i, HEIGHT - i - 1)] === playerSymbol) {
        count++;
      }
    }

    if (count === HEIGHT) {
      return true;
    }

    return false;
  }

  private checkThree(num: number, param: number): boolean {
    const idNum = this.fields[num];
    const idNum1 = this.fields[num - param];
    const idNum2 = this.fields[num + param];
    const idNum3 = this.fields[num + (param * 2)];

    if ((idNum === idNum1 && idNum2 === idNum && idNum3 === idNum) && (idNum !== '')) {
      num += 1;

      this.winnerFiledIndexes = [
        num - param - 1,
        num - 1,
        num + param - 1,
        num + (param * 2) - 1
      ];

      return true;
    }

    return false;
  }

  private getPositionForMove(c: number, r: number): number {
    return c + r * 4;
  }
}
