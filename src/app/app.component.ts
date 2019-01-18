import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { GameResult } from './enums/game-result.enum';
import { PlayerSymbol } from './enums/player-symbol.enum';
import { Player } from './enums/player.enum';
import { GameEnd } from './interfaces/game-end.interface';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  fields$: Observable<string[]>;
  gameEnd: GameEnd;
  gameStarted = false;
  optionsForm: FormGroup;
  player = Player;
  playerSymbol = PlayerSymbol;

  constructor(private fb: FormBuilder, private gameService: GameService, private snack: MatSnackBar) {
  }

  getGameEndResultClass(): string {
    if (!this.gameEnd) {
      return '';
    }

    let c;

    switch (this.gameEnd.result) {
      case GameResult.Tie: {
        c = 'tie';
        break;
      }

      case GameResult.Lose: {
        c = 'lose';
        break;
      }

      case GameResult.Win: {
        c = 'win';
        break;
      }
    }

    return c;
  }

  humanMove(index: number): void {
    index = parseInt(index as any, 10);
    this.gameService.humanMove(index);
  }

  isWinnerField(index: number): boolean {
    if (this.gameEnd && this.gameEnd.winnerFields && this.gameEnd.winnerFields.length > 0) {
      index = parseInt(index as any, 10);
      return this.gameEnd.winnerFields.indexOf(index) !== -1;
    }

    return false;
  }

  ngOnInit(): void {
    this.fields$ = this.gameService.fields$;
    this.initOptionsForm();
    this.initGameStartedWatcher();
    this.initGameEndWatcher();
  }

  order(a: KeyValue<number, string>, b: KeyValue<number, string>): boolean {
    return a.key > b.key;
  }

  reset(): void {
    this.resetState();
    this.gameService.reset();
  }

  start(): void {
    const options = this.optionsForm.getRawValue();
    this.gameService.setHumanSymbol(options.humanSymbol);
    this.gameService.setFirstPlayer(options.firstPlayer);
    this.gameService.start();
  }

  trackByKey(a: KeyValue<number, string>): number {
    return a.key;
  }

  private initGameEndWatcher(): void {
    this.gameService.gameEnd$.subscribe(gameEnd => {
      let message;

      switch (gameEnd.result) {
        case GameResult.Tie: {
          message = 'Gra zakończyła się remisem!';
          break;
        }

        case GameResult.Lose: {
          message = 'Gra zakończyła się przegraną!';
          break;
        }

        case GameResult.Win: {
          message = 'Gra zakończyła się wygraną!';
          break;
        }
      }

      this.snack.open(message, 'Reset', {
        duration: -1
      }).onAction().subscribe(() => {
        this.reset();
      });
      this.gameEnd = gameEnd;
    });
  }

  private initGameStartedWatcher(): void {
    this.gameService.gameStarted$.subscribe(gameStarted => {
      this.gameStarted = gameStarted;

      if (gameStarted) {
        this.optionsForm.disable();
      } else {
        this.optionsForm.enable();
      }
    });
  }

  private initOptionsForm(): void {
    this.optionsForm = this.fb.group({
      firstPlayer: [Player.Computer],
      humanSymbol: [PlayerSymbol.O]
    });
  }

  private resetState(): void {
    this.gameEnd = undefined;
    this.gameStarted = false;
  }
}
