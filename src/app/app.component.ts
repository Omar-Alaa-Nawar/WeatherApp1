import { Component, OnInit } from '@angular/core';
import { WeatherService } from './services/weather.service';
import { WeatherData } from './models/weather.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, WeatherDisplayComponent],
  providers: [WeatherService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cityControl = new FormControl();
  weatherData: WeatherData | null = null;
  searchForm: FormGroup;  // Explicitly declare
  filteredCities: Observable<string[]> = of([]);
  error: boolean = false;

  constructor(private weatherService: WeatherService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({ city: this.cityControl }); // Initialize form
  }

  ngOnInit(): void {
    this.getUserLocation();

    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => value ? this.weatherService.getCitySuggestions(value).pipe(
        map(response => Array.isArray(response) ? response.map(city => city) : []),
        catchError(() => of([]))
      ) : of([]))
    );
  }

  onCitySelect(city: string) {
    this.getWeatherData(city);
  }

  private getWeatherData(cityName: string) {
    this.error = false;
    this.weatherService.getWeatherData(cityName).subscribe({
      next: (response) => {
        this.weatherData = response;
        this.cityControl.reset();
      },
      error: () => {
        this.error = true;
      }
    });
  }

  private getUserLocation() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => this.getWeatherDataByCoords(position.coords.latitude, position.coords.longitude),
        () => this.getWeatherData('Cairo')
      );
    } else {
      this.getWeatherData('Cairo');
    }
  }

  private getWeatherDataByCoords(lat: number, lon: number) {
    this.error = false;
    this.weatherService.getWeatherDataByCoords(lat, lon).subscribe({
      next: (response) => {
        this.weatherData = response;
      },
      error: () => {
        this.error = true;
      }
    });
  }
}
