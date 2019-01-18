import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { GameResult } from '../enums/game-result.enum';
import { PlayerSymbol } from '../enums/player-symbol.enum';
import { Player } from '../enums/player.enum';
import { GameEnd } from '../interfaces/game-end.interface';
import { Row } from '../types/row.type';
import { MoveService } from './move.service';
import { OptionsService } from './options.service';
import { WinService } from './win.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  fields$ = new BehaviorSubject<string[]>([]);
  gameEnd$ = new Subject<GameEnd>();
  gameStarted$ = new BehaviorSubject<boolean>(false);
  private fields: string[];
  private gameStarted = false;

  constructor(private optionsService: OptionsService, private moveService: MoveService, private winService: WinService) {
    this.reset();
  }

  humanMove(num: number): void {
    if (!this.gameStarted) {
      return;
    }

    this.placeMove(num, this.optionsService.humanSymbol);

    if (!this.checkEndGame(Player.Human)) {
      this.computerMove();
    }
  }

  reset(): void {
    this.gameStarted = false;
    this.gameStarted$.next(this.gameStarted);
    this.fields = [];

    for (let i = 0; i < 16; i++) {
      this.fields.push('');
    }

    this.fields$.next(this.fields);
  }

  setFirstPlayer(player: Player): void {
    this.optionsService.firstPlayer = player;
  }

  setHumanSymbol(symbol: PlayerSymbol): void {
    this.optionsService.humanSymbol = symbol;
    this.optionsService.computerSymbol = symbol === PlayerSymbol.O ? PlayerSymbol.X : PlayerSymbol.O;
  }

  start(): void {
    if (this.gameStarted) {
      return;
    }

    this.gameStarted = true;
    this.gameStarted$.next(this.gameStarted);

    if (this.optionsService.firstPlayer === Player.Computer) {
      this.computerMove();
    }
  }

  private checkEndGame(player: Player): boolean {
    const winnerFields = this.winService.checkWin(this.fields);

    if (winnerFields.length > 0) {
      this.gameEnd$.next({
        result: player === Player.Human ? GameResult.Win : GameResult.Lose,
        winnerFields: winnerFields as Row || undefined
      });

      return true;
    } else if (this.winService.checkTie(this.fields)) {
      this.gameEnd$.next({
        result: GameResult.Tie
      });

      return true;
    }

    return false;
  }

  private computerMove(): void {
    this.placeMove(this.moveService.decision(this.fields), this.optionsService.computerSymbol);
    this.checkEndGame(Player.Computer);
  }

  private placeMove(num: number, symbol: PlayerSymbol): void {
    this.fields.splice(num, 1, symbol);
    this.fields$.next(this.fields);
  }
}
