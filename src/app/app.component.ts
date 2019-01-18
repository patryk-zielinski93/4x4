import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PlayerSymbol } from './enums/player-symbol.enum';
import { Player } from './enums/player.enum';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  fields$: Observable<string[]>;
  optionsForm: FormGroup;
  player = Player;
  playerSymbol = PlayerSymbol;

  constructor(private fb: FormBuilder, private gameService: GameService) {
  }

  checkField(index: number): void {
    index = parseInt(index as any, 10);
    this.gameService.humanMove(index);
  }

  ngOnInit(): void {
    this.fields$ = this.gameService.fields$;
    this.initOptionsForm();
    this.initGameStartedWatcher();
  }

  order(a: KeyValue<number, string>, b: KeyValue<number, string>): boolean {
    return a.key > b.key;
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

  private initGameStartedWatcher(): void {
    this.gameService.gameStarted$.subscribe(gameStarted => {
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
}
