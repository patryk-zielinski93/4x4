import { Injectable } from '@angular/core';
import { Row } from '../types/row.type';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private fields: string[];
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

  constructor(private optionsService: OptionsService) {
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
}
