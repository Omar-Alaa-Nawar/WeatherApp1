import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from './services/weather.service';
import { WeatherData } from './models/weather.model';
import { FormsModule, ReactiveFormsModule, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  providers: [WeatherService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  cityName: string = '';
  weatherData?: WeatherData;
  mode: 'day' | 'night' | 'default' = 'default';
  latitude: number = 0;
  longitude: number = 0;
  error: boolean = false;

  // FormControl for autocomplete input
  cityControl = new FormControl();
  filteredCities: Observable<string[]> = of([]);
  searchForm!: FormGroup;

  constructor(private weatherService: WeatherService, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.getUserLocation();

    // Initialize the form group with city control
    this.searchForm = this.fb.group({
      city: this.cityControl
    });

    // Set up the autocomplete functionality for city input
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        if (value) {
          return this.weatherService.getCitySuggestions(value).pipe(
            map(response => response?.features?.map((feature: any) => feature.properties.city) || []),
            catchError(() => of([]))  // In case of an error, return an empty array
          );
        } else {
          return of([]);  // Return an empty array if no value is entered
        }
      })
    );
  }

  onSubmit() {
    const selectedCity = this.cityControl.value;
    if (selectedCity) {
      console.log('Form submitted with city:', selectedCity);
      this.getWeatherData(selectedCity);
    }
  }

  private getWeatherData(cityName: string) {
    this.error = false;
    console.log('Fetching weather data for:', cityName);
    this.weatherService.getWeatherData(cityName)
      .subscribe({
        next: (response) => {
          this.weatherData = response;
          console.log('Weather data received:', response);
          this.updateMode();
          this.cityControl.reset();  // Reset control after successfully fetching data
        },
        error: (err) => {
          console.error('Error fetching weather data:', err);
          this.error = true;
        }
      });
  }

  private getWeatherDataByCoords(lat: number, lon: number) {
    this.error = false;
    console.log('Fetching weather data for coordinates:', lat, lon);
    this.weatherService.getWeatherDataByCoords(lat, lon)
      .subscribe({
        next: (response) => {
          this.weatherData = response;
          console.log('Weather data received:', response);
          this.updateMode();
        },
        error: (err) => {
          console.error('Error fetching weather data:', err);
          this.error = true;
        }
      });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      this.showLoadingIndicator();

      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        console.log('User location:', this.latitude, this.longitude);
        this.getWeatherDataByCoords(this.latitude, this.longitude);
        this.hideLoadingIndicator();
      }, (error) => {
        console.error('Error getting location', error);
        this.getWeatherData('Cairo');
        this.hideLoadingIndicator();
      }, {
        timeout: 5000,
        maximumAge: 60000
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.getWeatherData('Cairo');
    }
  }

  showLoadingIndicator() {
    console.log('Loading...');
  }

  hideLoadingIndicator() {
    console.log('Loading complete.');
  }

  isNightTime(): boolean {
    if (!this.weatherData || !this.weatherData.sys) {
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const isNight = currentTime < this.weatherData.sys.sunrise || currentTime >= this.weatherData.sys.sunset;
    console.log('isNightTime:', isNight);
    return isNight;
  }

  isHotNight(): boolean {
    return this.isNightTime() && this.weatherData?.main?.temp !== undefined && this.weatherData.main.temp > 30;
  }

  isSunnyDay(): boolean {
    return !this.isNightTime() && this.weatherData?.main?.temp !== undefined && this.weatherData.main.temp > 30;
  }

  isClear(): boolean {
    const isClear = this.weatherData?.main?.temp !== undefined && this.weatherData.main.temp >= 15 && this.weatherData.main.temp <= 30;
    console.log('isClear:', isClear);
    return isClear;
  }

  isCold(): boolean {
    const isCold = this.weatherData?.main?.temp !== undefined && this.weatherData.main.temp < 15;
    console.log('isCold:', isCold);
    return isCold;
  }

  isWindy(): boolean {
    const isWindy = this.weatherData?.wind?.speed !== undefined && this.weatherData.wind.speed > 25;
    console.log('isWindy:', isWindy);
    return isWindy;
  }

  updateMode() {
    if (this.isNightTime()) {
      this.mode = 'night';
    } else if (this.isSunnyDay() || this.isCold() || this.isWindy()) {
      this.mode = 'day';
    } else {
      this.mode = 'default';
    }
    console.log('Mode updated to:', this.mode);
  }
}
