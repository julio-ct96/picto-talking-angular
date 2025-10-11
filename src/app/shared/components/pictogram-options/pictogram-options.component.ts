import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  Signal,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { AccessibleEventTriggerDirective } from '@shared/directives/accessible-event-trigger/accessible-event-trigger.directive';
import {
  PictogramOption,
  PictogramOptionSelectedEvent,
  PictogramOptionsSelectionChangedEvent,
} from './pictogram-options.interface';

interface PictogramOptionViewModel {
  readonly option: PictogramOption;
  readonly isSelected: boolean;
  readonly ariaLabel: string;
}

@Component({
  selector: 'pic-pictogram-options',
  imports: [NgOptimizedImage, AccessibleEventTriggerDirective],
  templateUrl: './pictogram-options.component.html',
  styleUrl: './pictogram-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictogramOptionsComponent implements OnInit {
  readonly options = input.required<readonly PictogramOption[]>();

  readonly multiSelect = input<boolean>(false);

  readonly ariaLabel = input<string>('Choose an option');

  readonly disabled = input<boolean>(false);

  readonly initialSelectedIds = input<readonly string[]>([]);

  private readonly _selectedIds = signal<Set<string>>(new Set());

  readonly optionSelected = output<PictogramOptionSelectedEvent>();

  readonly selectionChanged = output<PictogramOptionsSelectionChangedEvent>();

  readonly optionViewModels = computed<readonly PictogramOptionViewModel[]>(() => {
    const options = this.options();
    const selectedIds = this._selectedIds();
    const isMultiSelect = this.multiSelect();

    return options.map((option) => {
      const isSelected = selectedIds.has(option.id);
      const ariaLabel = isMultiSelect
        ? `${option.label}, ${isSelected ? 'selected' : 'not selected'}. Click to toggle selection`
        : `Select ${option.label}`;

      return {
        option,
        isSelected,
        ariaLabel,
      };
    });
  });

  readonly hasOptions = computed(() => this.options().length > 0);

  readonly ariaMultiselectable: Signal<'true' | null> = computed(() =>
    this.multiSelect() ? 'true' : null,
  );

  ngOnInit(): void {
    const initialIds = this.initialSelectedIds();
    if (initialIds.length > 0) {
      this._selectedIds.set(new Set(initialIds));
    }
  }

  onSelectOption(option: PictogramOption): void {
    if (this.disabled()) {
      return;
    }

    if (this.multiSelect()) {
      this.toggleSelection(option);
    } else {
      this.optionSelected.emit({
        optionId: option.id,
        option,
      });
    }
  }

  private toggleSelection(option: PictogramOption): void {
    const currentSelected = new Set(this._selectedIds());
    const isCurrentlySelected = currentSelected.has(option.id);

    if (isCurrentlySelected) {
      currentSelected.delete(option.id);
    } else {
      currentSelected.add(option.id);
    }

    this._selectedIds.set(currentSelected);

    const selectedOptions = this.options().filter((opt) => currentSelected.has(opt.id));

    this.selectionChanged.emit({
      selectedIds: Array.from(currentSelected),
      selectedOptions,
      lastChangedId: option.id,
      isSelected: !isCurrentlySelected,
    });
  }
}
