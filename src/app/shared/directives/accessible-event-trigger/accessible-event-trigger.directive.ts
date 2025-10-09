import {
  computed,
  Directive,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import {
  FOCUSABLE_TAB_INDEX,
  NON_FOCUSABLE_TAB_INDEX,
} from '@shared/constants/accessibility-constants';
import { ENTER_KEY, SPACE_KEY } from '@shared/constants/keyboard-constants';

@Directive({
  selector: '[pic-accessible-event-trigger]',
  host: {
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
    '[attr.tabindex]': 'tabIndex()',
  },
})
export class AccessibleEventTriggerDirective {
  readonly disableAccessibleTrigger: InputSignal<boolean> = input<boolean>(false);

  readonly activated: OutputEmitterRef<MouseEvent | KeyboardEvent> = output({
    alias: 'pic-accessible-event-trigger',
  });

  readonly tabIndex = computed(() =>
    this.disableAccessibleTrigger() ? NON_FOCUSABLE_TAB_INDEX : FOCUSABLE_TAB_INDEX,
  );

  handleClick(event: MouseEvent): void {
    if (this.disableAccessibleTrigger()) return;

    this.activated.emit(event);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.disableAccessibleTrigger()) return;

    if (event.key === ENTER_KEY || event.key === SPACE_KEY) {
      event.preventDefault();
      this.activated.emit(event);
    }
  }
}
