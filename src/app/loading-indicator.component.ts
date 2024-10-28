import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  template: `
    <div *ngIf="isLoading" class="loading-spinner">
      Loading...
    </div>
  `,
  styles: [`
    .loading-spinner {
      text-align: center;
      padding: 20px;
      font-size: 20px;
    }
  `]
})
export class LoadingIndicatorComponent {
  @Input() isLoading: boolean = false;
}
