import { Injectable } from '@angular/core';
import { PlayerSymbol } from '../enums/player-symbol.enum';
import { Player } from '../enums/player.enum';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {
  computerSymbol = PlayerSymbol.X;
  firstPlayer = Player.Computer;
  humanSymbol = PlayerSymbol.O;
}
