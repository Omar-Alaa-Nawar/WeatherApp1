import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WeatherData } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private weatherApiKey = 'ff4f8f78423ae2809d9c7ba5dc643913'; // OpenWeatherMap API Key
  private geoapifyUrl = 'https://api.geoapify.com/v1/geocode/autocomplete'; // Geoapify Autocomplete API URL
  private geoapifyApiKey = '4eddb7d9c3af45e5a44a5834fce22674'; // Geoapify API Key

  constructor(private http: HttpClient) { }

  getWeatherData(cityName: string): Observable<WeatherData> {
    const url = `${this.apiUrl}?q=${cityName}&appid=${this.weatherApiKey}&units=metric`;
    return this.http.get<WeatherData>(url);
  }

  getWeatherDataByCoords(lat: number, lon: number): Observable<WeatherData> {
    const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric`;
    return this.http.get<WeatherData>(url);
  }

  // Updated method to get city suggestions using Geoapify Autocomplete API
  getCitySuggestions(query: string): Observable<any> {
    const url = `${this.geoapifyUrl}?text=${encodeURIComponent(query)}&apiKey=${this.geoapifyApiKey}`;
    return this.http.get<any>(url);
  }
}