import { Component, Input, OnChanges } from '@angular/core';
import { WeatherData } from '../models/weather.model';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-weather-display',
  standalone: true,
  templateUrl: './weather-display.component.html',
  styleUrls: ['./weather-display.component.css'],
  imports: [CommonModule] // Add CommonModule here
})
export class WeatherDisplayComponent implements OnChanges {
  @Input() weatherData?: WeatherData;
  mode: 'day' | 'night' | 'default' = 'default';

  ngOnChanges() {
    this.updateMode();
  }

  private updateMode() {
    if (this.isNightTime()) {
      this.mode = 'night';
    } else if (this.isSunnyDay() || this.isCold() || this.isWindy()) {
      this.mode = 'day';
    } else {
      this.mode = 'default';
    }
  }

  isNightTime(): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const sunrise = this.weatherData?.sys?.sunrise ?? 0;
    const sunset = this.weatherData?.sys?.sunset ?? 0;
    return currentTime < sunrise || currentTime >= sunset;
  }

  isHotNight(): boolean {
    return this.isNightTime() && (this.weatherData?.main?.temp ?? 0) > 30;
  }

  isSunnyDay(): boolean {
    return !this.isNightTime() && (this.weatherData?.main?.temp ?? 0) > 30;
  }

  isClear(): boolean {
    const temp = this.weatherData?.main?.temp ?? 0;
    return temp >= 15 && temp <= 30;
  }

  isCold(): boolean {
    const temp = this.weatherData?.main?.temp ?? 0;
    return temp < 15;
  }

  isWindy(): boolean {
    return (this.weatherData?.wind?.speed ?? 0) > 25;
  }
}
