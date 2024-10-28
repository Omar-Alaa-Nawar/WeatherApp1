import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormsModule, FormControl } from '@angular/forms'; // Import FormControl here
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf, AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    AsyncPipe,
    CommonModule,
    FormsModule // Add FormsModule here
  ]
})
export class SearchComponent {
  @Input() searchForm!: FormGroup;
  @Input() filteredCities: Observable<string[]> = of([]); // Initialize with an empty observable
  @Output() citySelected = new EventEmitter<string>();

  showAutocomplete = false;

  get cityControl(): FormControl {
    return this.searchForm.get('city') as FormControl;
  }

  cityName: string = '';

  onInput() {
    this.showAutocomplete = this.cityControl.value && this.cityControl.value.length > 0;
  }

  onSubmit() {
    if (this.searchForm.value.city) {
      this.citySelected.emit(this.searchForm.value.city);
    }
  }
}
