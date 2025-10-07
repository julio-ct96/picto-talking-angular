import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LandingSectionView } from '../../../features/landing/presentation/view-models/landing.view-model';
import { LandingSectionId } from '../../../features/landing/domain/value-objects/landing-section-id';

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

  onSelectSection(sectionId: LandingSectionId): void {
    this.sectionSelected.emit(sectionId);
  }
}
