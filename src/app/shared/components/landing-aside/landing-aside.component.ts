import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { LandingSectionView } from '@features/landing/presentation/view-models/landing.view-model';
import { LandingSectionId } from '@features/landing/domain/value-objects/landing-section-id';

@Component({
  selector: 'pic-landing-aside',
  standalone: true,
  templateUrl: './landing-aside.component.html',
  styleUrl: './landing-aside.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingAsideComponent {
  readonly sections = input.required<readonly LandingSectionView[]>();
  readonly locale = input.required<string>();
  readonly menuCollapsed = input<boolean>(false);
  readonly activeSectionId = input<LandingSectionId | null>(null);

  readonly sectionSelected = output<LandingSectionId>();
  readonly sidebarToggled = output<void>();

  readonly isEnglish = computed<boolean>(() => this.locale() === 'en');
  readonly navigationAriaLabel = computed<string>(() =>
    this.isEnglish() ? 'Landing sections' : 'Secciones de la landing',
  );
  readonly sectionTitle = computed<string>(() =>
    this.isEnglish() ? 'Sections' : 'Secciones',
  );
  readonly toggleButtonLabel = computed<string>(() => {
    const collapsed = this.menuCollapsed();

    if (this.isEnglish()) {
      return collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    }

    return collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral';
  });
  readonly toggleButtonIcon = computed<string>(() => (this.menuCollapsed() ? '›' : '‹'));
  readonly toggleButtonAriaExpanded = computed<boolean>(() => !this.menuCollapsed());

  onSelectSection(sectionId: LandingSectionId): void {
    this.sectionSelected.emit(sectionId);
  }

  onToggleSidebar(): void {
    this.sidebarToggled.emit();
  }
}
