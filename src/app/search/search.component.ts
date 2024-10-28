import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgIf, AsyncPipe, CommonModule } from '@angular/common'; // Added CommonModule

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [ReactiveFormsModule, MatAutocompleteModule, NgIf, AsyncPipe, CommonModule] // Add CommonModule
})
export class SearchComponent {
  @Input() searchForm!: FormGroup;
  @Input() filteredCities!: Observable<string[]>;
  @Output() citySelected = new EventEmitter<string>();

  onSubmit() {
    if (this.searchForm.value.city) {
      this.citySelected.emit(this.searchForm.value.city);
    }
  }
}
