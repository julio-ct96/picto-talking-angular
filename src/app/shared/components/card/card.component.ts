import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  input,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { AccessibleEventTriggerDirective } from '@shared/directives/accessible-event-trigger/accessible-event-trigger.directive';

@Component({
  selector: 'pic-card',
  imports: [NgOptimizedImage, AccessibleEventTriggerDirective],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly pictogramUrl = input.required<string>();
  readonly imageAlt = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly isExpanded = input<boolean>(false);

  readonly activate = output<string>();

  readonly footerContent = contentChild('[card-footer]', { read: ElementRef });
  readonly hasFooterContent = computed(() => !!this.footerContent());

  onActivate(): void {
    this.activate.emit(this.id());
  }
}
