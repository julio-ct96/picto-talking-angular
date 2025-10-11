/**
 * Represents a single pictogram option
 * Domain model for pictogram selection UI
 */
export interface PictogramOption {
  readonly id: string;
  readonly label: string;
  readonly pictogramUrl: string;
  readonly imageAlt: string;
}

/**
 * Event emitted when a pictogram option is selected (single-select mode)
 */
export interface PictogramOptionSelectedEvent {
  readonly optionId: string;
  readonly option: PictogramOption;
}

/**
 * Event emitted when pictogram options selection changes (multi-select mode)
 * Contains all currently selected option IDs
 */
export interface PictogramOptionsSelectionChangedEvent {
  readonly selectedIds: readonly string[];
  readonly selectedOptions: readonly PictogramOption[];
  readonly lastChangedId: string;
  readonly isSelected: boolean;
}
