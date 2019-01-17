import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerSymbol } from '../enums/player-symbol.enum';
import { Player } from '../enums/player.enum';
import { MoveService } from './move.service';
import { OptionsService } from './options.service';
import { WinService } from './win.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  fields$ = new BehaviorSubject<string[]>([]);
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

    const winnerFields = this.winService.checkWin(this.fields);

    if (winnerFields.length > 0) {
      console.log('win', winnerFields);
    } else if (this.winService.checkTie(this.fields)) {
      console.log('tie');
    } else {
      this.computerMove(this.moveService.decision(this.fields));
    }
  }

  start(): void {
    if (this.gameStarted) {
      return;
    }
  }

  reset(): void {
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

    if (this.optionsService.firstPlayer === Player.Computer) {
      this.computerMove(5);
    }
  }

  private computerMove(num: number): void {
    this.placeMove(num, this.optionsService.computerSymbol);

    const winnerFields = this.winService.checkWin(this.fields);

    if (winnerFields.length > 0) {
      console.log('win', winnerFields);
    } else if (this.winService.checkTie(this.fields)) {
      console.log('tie');
    }
  }

  private placeMove(num: number, symbol: PlayerSymbol): void {
    this.fields.splice(num, 1, symbol);
    console.log(this.fields);
    this.fields$.next(this.fields);
  }
}
