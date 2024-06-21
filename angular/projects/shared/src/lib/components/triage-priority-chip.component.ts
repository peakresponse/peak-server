import { Component, Input } from '@angular/core';

enum Priority {
  immediate = 0,
  delayed,
  minimal,
  expectant,
  deceased,
  transported,
  unknown,
}

const PriorityDescriptions = [
  $localize`:@@TriagePriority.immediate:Immediate`,
  $localize`:@@TriagePriority.delayed:Delayed`,
  $localize`:@@TriagePriority.minimal:Minor`,
  $localize`:@@TriagePriority.expectant:Expectant`,
  $localize`:@@TriagePriority.deceased:Dead`,
  $localize`:@@TriagePriority.transported:Transported`,
  $localize`:@@TriagePriority.unknown:Unknown`,
];
Object.freeze(PriorityDescriptions);

export class TriagePriority {
  static immediate = Priority.immediate;
  static delayed = Priority.delayed;
  static minimal = Priority.minimal;
  static expectant = Priority.expectant;
  static deceased = Priority.deceased;
  static transported = Priority.transported;
  static unknown = Priority.unknown;
  static allCases = Object.values(Priority).slice(7);

  static toString(priority?: Priority): string {
    return priority !== undefined ? PriorityDescriptions[priority] : PriorityDescriptions[Priority.unknown];
  }
}

@Component({
  selector: 'shared-triage-priority-chip',
  templateUrl: './triage-priority-chip.component.html',
})
export class TriagePriorityChipComponent {
  @Input() priority?: Priority;

  get priorityString(): string {
    return TriagePriority.toString(this.priority);
  }
}
