import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  fields: Observable<string[]>;

  constructor(private gameService: GameService) {
  }

  checkField(index: number): void {
    index = parseInt(index as any, 10);
    this.gameService.humanMove(index);
  }

  ngOnInit(): void {
    this.fields = this.gameService.fields$;
  }

  order(a: KeyValue<number, string>, b: KeyValue<number, string>): boolean {
    return a.key > b.key;
  }

  start(): void {
    this.gameService.start();
  }

  trackByKey(a: KeyValue<number, string>): number {
    return a.key;
  }
}
