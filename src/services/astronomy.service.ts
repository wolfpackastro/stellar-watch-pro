import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// --- IMPORTANT ---
// Replace these placeholders with your actual AstronomyAPI credentials.
// In a production app, these should be stored securely in environment variables.
// FIX: Replaced hardcoded secrets with placeholders and explicitly typed them as `string`. This resolves the TypeScript comparison error and restores the intended behavior of the configuration check.
const ASTRONOMYAPI_APP_ID: string = 'YOUR_APPLICATION_ID';
const ASTRONOMYAPI_SECRET: string = 'YOUR_APPLICATION_SECRET';
// --- IMPORTANT ---

// Interface for the simplified data structure returned to components
export interface CelestialPosition {
  name: string;
  ra: string;
  dec: string;
  altitude: number;
  azimuth: number;
}

// Interfaces for the raw AstronomyAPI response structure
interface ApiPositionData {
  horizonal: {
    altitude: { degrees: string };
    azimuth: { degrees: string };
  };
  rightAscension: { hms: string };
  declination: { dms: string };
}

interface ApiCell {
  position: {
    data: ApiPositionData;
  }
}

interface ApiRow {
  entry: {
    cells: ApiCell[];
  }
}

interface ApiTableData {
  header: {
    name: string;
  };
  rows: ApiRow[];
}

interface ApiResponse {
  data: {
    tables: ApiTableData[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AstronomyService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.astronomyapi.com/api/v2/bodies/positions';
  
  // Check if credentials are placeholders
  areCredentialsConfigured(): boolean {
    return ASTRONOMYAPI_APP_ID !== 'YOUR_APPLICATION_ID' && ASTRONOMYAPI_SECRET !== 'YOUR_APPLICATION_SECRET';
  }

  async getBodyPositions(lat: number, lon: number, elevation: number, timestamp: Date, bodies: string[]): Promise<CelestialPosition[]> {
    if (!this.areCredentialsConfigured()) {
      throw new Error('AstronomyAPI credentials are not configured. Please update them in src/services/astronomy.service.ts');
    }

    const authString = btoa(`${ASTRONOMYAPI_APP_ID}:${ASTRONOMYAPI_SECRET}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json'
    });

    const date = timestamp.toISOString().split('T')[0];
    const time = timestamp.toTimeString().split(' ')[0];

    const body = {
      latitude: lat,
      longitude: lon,
      elevation: elevation,
      from_date: date,
      to_date: date,
      time: time,
      bodies: bodies
    };

    try {
      const response = await firstValueFrom(this.http.post<ApiResponse>(this.apiUrl, body, { headers }));
      return this.transformResponse(response.data.tables);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('API Error:', error.message);
        throw new Error(`Failed to fetch data from AstronomyAPI: ${error.status} ${error.statusText}`);
      }
      console.error('Unknown error fetching celestial positions:', error);
      throw new Error('An unexpected error occurred while fetching celestial data.');
    }
  }

  private transformResponse(tables: ApiTableData[]): CelestialPosition[] {
    return tables.map(table => {
      // For this endpoint, the API returns one row per table.
      const row = table.rows[0];
      const cellData = row.entry.cells[0];
      const positionData = cellData.position.data;
      return {
        name: table.header.name,
        ra: positionData.rightAscension.hms,
        dec: positionData.declination.dms,
        altitude: parseFloat(positionData.horizonal.altitude.degrees),
        azimuth: parseFloat(positionData.horizonal.azimuth.degrees),
      };
    });
  }
}
