import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://nominatim.openstreetmap.org/search';

  async geocode(query: string): Promise<{ lat: string, lon: string } | null> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&format=json&limit=1`;
    try {
      const results = await firstValueFrom(this.http.get<GeocodeResult[]>(url));
      if (results && results.length > 0) {
        return { lat: results[0].lat, lon: results[0].lon };
      }
      return null;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('Geocoding API Error:', error.message);
        throw new Error(`Failed to fetch data from Geocoding API: ${error.status} ${error.statusText}`);
      }
      console.error('Unknown error during geocoding:', error);
      throw new Error('An unexpected error occurred while resolving the location.');
    }
  }
}
