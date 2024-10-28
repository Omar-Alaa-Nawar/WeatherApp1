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
  searchForm: FormGroup;
  filteredCities: Observable<string[]> = of([]);
  error = false;

  constructor(private weatherService: WeatherService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({ city: this.cityControl });
  }

  ngOnInit(): void {
    this.getUserLocation();

    // Set up city suggestions based on user input
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => value ? this.weatherService.getCitySuggestions(value).pipe(
        map(response => response.features.map((feature: any) => feature.properties.city)),
        catchError(() => of([])) // Return empty array on error
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
        this.cityControl.reset(); // Clear city input after data is retrieved
      },
      error: () => {
        this.error = true; // Set error flag if request fails
      }
    });
  }

  private getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => this.getWeatherDataByCoords(position.coords.latitude, position.coords.longitude),
        () => this.getWeatherData('Cairo') // Fallback city if geolocation fails
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
