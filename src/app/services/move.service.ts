import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerSymbol } from '../enums/player-symbol.enum';
import { Player } from '../enums/player.enum';
import { Row } from '../types/row.type';
import { OptionsService } from './options.service';
import { WinService } from './win.service';

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private cutoffOccurred = false;
  private depthCutoff = 0;
  private depthReached = 0;
  private fields: string[];
  private maxValuePruning = 0;
  private minValuePruning = 0;
  private nodesExplored: number;
  private rowsToMatch: Row[] = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];
  private startTime: number;
  private timeCutoff = 500;

  constructor(private optionsService: OptionsService, private winService: WinService, private http: HttpClient) {
  }

  decision(fields: string[]): number {
    this.fields = fields;

    let decision;

    decision = this.goForRow();
    if (decision !== -1) {
      return decision;
    }

    decision = this.preemptiveBlock();
    if (decision !== -1) {
      return decision;
    }

    decision = this.smartMove();
    if (decision !== -1) {
      return decision;
    }

    decision = this.randomMove();
    if (decision !== -1) {
      return decision;
    }
  }

  newDecision(fields: string[], player: Player): number {
    this.cutoffOccurred = false;
    this.depthCutoff = 0;
    this.depthReached = 0;
    this.nodesExplored = 1;
    this.minValuePruning = 0;
    this.maxValuePruning = 0;
    this.startTime = (new Date()).getTime();
    this.fields = fields;

    const possibleMoves = this.getPossibleMoves(player);
    const moveChoices: number[] = [];

    let bestMoveValue = Number.MIN_VALUE;

    for (let i = 0; i < possibleMoves.length; i++) {
      const moveValue = this.minValue(possibleMoves[i], -1000, 1000, 0);

      if (moveValue > bestMoveValue) {
        moveChoices.push(i);
        bestMoveValue = moveValue;
      } else if (moveValue === bestMoveValue) {
        moveChoices.push(i);
      }
    }
    console.log(possibleMoves, moveChoices);

    return this.randomMove();
  }

  serverDecision(fields: string[], playerSymbol: PlayerSymbol): Observable<number> {
    return this.http.post<{ move: number }>('http://localhost:8888', {fields, playerSymbol, player: this.optionsService.firstPlayer})
      .pipe(
        map(res => res.move)
      );
  }

  private checkArrAmounts() {
    let amt = 0;

    for (let i = this.fields.length - 1; i >= 0; i--) {
      if (this.fields[i] === 'X' || this.fields[i] === 'O') {
        amt++;
      }
    }

    return amt;
  }

  private checkLosingRow(row: Row): number {
    const block = this.fields[row[0]];
    const block1 = this.fields[row[1]];
    const block2 = this.fields[row[2]];
    const block3 = this.fields[row[3]];

    const hs = this.optionsService.humanSymbol;
    if (
      (
        (block === (block1 || block2 || block3)) &&
        block === hs && (((block1 && block2) ||
          (block3 && block2) ||
          (block1 && block3)) === '')
      )
      || (
        (block1 === (block || block2 || block3)) &&
        block1 === hs &&
        (((block && block2) || (block3 && block2) || (block && block3)) === '')
      )
      || (
        (block2 === (block || block1 || block3)) &&
        block2 === hs &&
        (((block && block1) || (block3 && block1) || (block && block3)) === '')
      )
      || (
        (block3 === (block || block1 || block2)) &&
        block3 === hs &&
        (((block && block1) || (block2 && block1) || (block && block2)) === '')
      )
    ) {
      return this.findBlank(row);
    }

    return -1;
  }

  private checkNumPlays(fields: string[], playerSymbol: PlayerSymbol, plays: number): number {
    const WIDTH = 4;
    const HEIGHT = 4;
    let total = 0;
    let count;

    // check horizontals
    for (let i = 0; i < HEIGHT; i++) {
      count = 0;
      for (let j = 0; j < WIDTH; j++) {
        if (fields[this.getPositionForMove(j, i)] === playerSymbol) {
          count++;
        } else {
          count = 0;
          break;
        }
      }

      if (count === WIDTH) {
        total++;
      }
    }

    // check verticals
    for (let i = 0; i < WIDTH; i++) {
      count = 0;
      for (let j = 0; j < HEIGHT; j++) {
        if (fields[this.getPositionForMove(i, j)] === playerSymbol) {
          count++;
        } else {
          count = 0;
          break;
        }
      }

      if (count === HEIGHT) {
        total++;
      }
    }

    // check horizontals
    count = 0;
    for (let i = 0; i < HEIGHT; i++) {
      if (fields[this.getPositionForMove(i, i)] === playerSymbol) {
        count++;
      } else {
        count = 0;
        break;
      }
    }
    if (count === HEIGHT) {
      total++;
    }

    count = 0;
    for (let i = 0; i < HEIGHT; i++) {
      if (fields[this.getPositionForMove(i, HEIGHT - i - 1)] === playerSymbol) {
        count++;
      } else {
        count = 0;
        break;
      }
    }
    if (count === HEIGHT) {
      total++;
    }

    return total;
  }

  private checkWinningRow(param1: number, param2: number, param3: number, param4: number): number {
    const block = this.fields[param1];
    const block1 = this.fields[param2];
    const block2 = this.fields[param3];
    const block3 = this.fields[param4];

    if (block === block1 && block3 === block && block2 === '' && block !== '') {
      return param3;
    } else if (block === block2 && block === block3 && block1 === '' && block !== '') {
      return param2;
    } else if (block === block2 && block === block1 && block3 === '' && block !== '') {
      return param4;
    } else if (block1 === block2 && block1 === block3 && block === '' && block1 !== '') {
      return param1;
    }

    return -1;
  }

  private evaluateFields(fields: string[]): number {
    let firstPlayerSymbol: PlayerSymbol;
    let secondPlayerSymbol: PlayerSymbol;
    if (this.optionsService.firstPlayer === Player.Human) {
      firstPlayerSymbol = this.optionsService.humanSymbol;
      secondPlayerSymbol = this.optionsService.computerSymbol;
    } else {
      firstPlayerSymbol = this.optionsService.computerSymbol;
      secondPlayerSymbol = this.optionsService.humanSymbol;
    }

    const X3 = this.checkNumPlays(fields, firstPlayerSymbol, 3);
    const X2 = this.checkNumPlays(fields, firstPlayerSymbol, 2);
    const X1 = this.checkNumPlays(fields, firstPlayerSymbol, 1);
    const O3 = this.checkNumPlays(fields, secondPlayerSymbol, 3);
    const O2 = this.checkNumPlays(fields, secondPlayerSymbol, 2);
    const O1 = this.checkNumPlays(fields, secondPlayerSymbol, 1);

    return 6 * X3 + 3 * X2 + X1 - (6 * O3 + 3 * O2 + O1);
  }

  private findBlank(row: Row): number {
    let len = 3;
    let index = -1;

    while (len >= 0) {
      if (this.fields[row[len]] === '') {
        index = row[len];
      }

      len--;
    }

    return index;
  }

  private getPositionForMove(c: number, r: number): number {
    return c + r * 4;
  }

  private getPossibleMoves(player: Player): Array<string[]> {
    const possibleMoves: Array<string[]> = [];

    for (let i = 0; i < 16; i++) {
      if (this.fields[i] === '') {
        const tempFields = this.fields.slice(0);
        this.makeMove(i, tempFields, player);
        possibleMoves.push(tempFields);
      }
    }

    return possibleMoves;
  }

  private goForRow(): number {
    const args = this.rowsToMatch;

    for (let i = 0; i < args.length; i++) {
      const decision = this.checkWinningRow(...args[i]);

      if (decision !== -1) {
        return decision;
      }
    }

    return -1;
  }

  private makeMove(index: number, fields: string[], player: Player): void {
    const symbol = player === Player.Human ? this.optionsService.humanSymbol : this.optionsService.computerSymbol;
    fields.splice(index, 1, symbol);
  }

  private maxValue(fields: string[], a: number, b: number, depth: number): number {
    this.nodesExplored++;

    if (depth > this.depthReached) {
      this.depthReached = depth;
    }

    if (this.testGameEnd(fields)) {
      return this.utilityValue(fields, depth);
    }

    if (this.depthCutoff > 0 && depth >= this.depthCutoff) {
      this.cutoffOccurred = true;
      return this.evaluateFields(fields);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.cutoffOccurred = true;
      return this.evaluateFields(fields);
    }

    let v = Number.MIN_VALUE;
    const possibleMoves = this.getPossibleMoves(Player.Computer);

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.minValue(possibleMoves[i], a, b, depth++));
      if (v >= b) {
        this.maxValuePruning++;
        return v;
      }
      a = Math.max(a, v);
    }

    return v;
  }

  private minValue(fields: string[], a: number, b: number, depth: number): number {
    this.nodesExplored++;

    if (depth > this.depthReached) {
      this.depthReached = depth;
    }

    if (this.testGameEnd(fields)) {
      return this.utilityValue(fields, depth);
    }

    if (this.depthCutoff > 0 && depth >= this.depthCutoff) {
      this.cutoffOccurred = true;
      return this.evaluateFields(fields);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.cutoffOccurred = true;
      return this.evaluateFields(fields);
    }

    let v = Number.MAX_VALUE;
    const possibleMoves = this.getPossibleMoves(Player.Computer);

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.maxValue(possibleMoves[i], a, b, depth++));
      if (v <= a) {
        this.minValuePruning++;
        return v;
      }
      b = Math.min(b, v);
    }

    return v;
  }

  private preemptiveBlock(): number {
    const args = this.rowsToMatch;

    for (let i = 0; i < args.length; i++) {
      const decision = this.checkLosingRow(args[i]);

      if (decision !== -1) {
        return decision;
      }
    }

    return -1;
  }

  private randomMove(): number {
    for (let i = this.fields.length - 1; i >= 0; i--) {
      if (this.fields[i] === '') {
        return i;
      }
    }
  }

  private smartMove(): number {
    const amt = this.checkArrAmounts();

    if (amt < 2) {
      if (this.fields[5] === '') {
        return 5;
      } else {
        return 6;
      }
    }

    return -1;
  }

  private testGameEnd(fields: string[]): boolean {
    return this.winService.checkTie(fields) || this.winService.checkWin(fields).length > 0;
  }

  private utilityValue(fields: string[], depth: number): number {
    if (this.winService.checkWinForPlayer(fields, this.optionsService.computerSymbol)) {
      return 1000 - depth;
    }

    if (this.winService.checkWinForPlayer(fields, this.optionsService.humanSymbol)) {
      return 1000 - depth;
    }

    if (this.winService.checkTie(fields)) {
      return 0;
    }

    return 0;
  }
}
