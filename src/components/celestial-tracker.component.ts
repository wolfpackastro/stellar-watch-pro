import { Component, ChangeDetectionStrategy, signal, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AstronomyService, CelestialPosition } from '../services/astronomy.service';
import { GeocodingService } from '../services/geocoding.service';
import { StarChartComponent } from './star-chart.component';

type Status = 'idle' | 'geocoding' | 'loading' | 'success' | 'error' | 'unconfigured';

@Component({
  selector: 'app-celestial-tracker',
  template: `
    <div class="border-2 border-red-900 bg-black/60 p-4 sm:p-6 rounded-lg shadow-lg shadow-red-900/20">
      
      @if (status() === 'unconfigured') {
        <div class="h-48 flex flex-col items-center justify-center text-center p-4">
           <h3 class="text-2xl font-bold text-yellow-500">Configuration Needed</h3>
           <p class="text-yellow-300/80 mt-2">AstronomyAPI credentials are not set. Please configure them in <code class="bg-yellow-900/50 px-1 rounded">src/services/astronomy.service.ts</code> to use this feature.</p>
        </div>
      } @else {
        <!-- Input Form -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div class="flex flex-col md:col-span-2">
            <label class="text-sm text-red-400 mb-1" for="location">Location Name, Zip, or "Lat, Lon"</label>
            <input id="location" type="text" [value]="locationQuery()" (input)="locationQuery.set($event.target.value)" placeholder="e.g., Yosemite or 34.05, -118.24" class="bg-black border border-red-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-red-400 mb-1" for="date">Date</label>
            <input id="date" type="date" [value]="date()" (input)="date.set($event.target.value)" class="bg-black border border-red-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
          </div>
          <div class="flex flex-col">
            <label class="text-sm text-red-400 mb-1" for="time">Time (UTC)</label>
            <input id="time" type="time" [value]="time()" (input)="time.set($event.target.value)" class="bg-black border border-red-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
          </div>
          <div class="flex flex-col justify-end">
            <button
              (click)="fetchPositions()"
              [disabled]="status() === 'loading' || status() === 'geocoding'"
              class="w-full h-[42px] px-4 py-2 rounded-md transition-colors duration-300 text-lg font-bold bg-red-900/80 hover:bg-red-800/90 text-red-200 disabled:bg-red-900/40 disabled:cursor-not-allowed">
              @if (status() === 'geocoding') {
                <span class="animate-pulse">Resolving...</span>
              } @else if (status() === 'loading') {
                <span class="animate-pulse">Fetching...</span>
              } @else {
                <span>Get Positions</span>
              }
            </button>
          </div>
        </div>
        
        @if(resolvedCoordinates(); as coords) {
          <div class="text-center text-xs text-red-400/70 mb-4 -mt-2">
            Resolved to Lat: {{coords.lat.toFixed(4)}}, Lon: {{coords.lon.toFixed(4)}}
          </div>
        }

        <!-- Results Display -->
        <div class="min-h-[160px] p-4 bg-black/50 border border-red-800/50 rounded-lg flex items-center justify-center">
          @switch (status()) {
            @case ('idle') {
              <p class="text-red-400/70">Enter a location and timestamp to track celestial bodies.</p>
            }
            @case ('geocoding') {
              <p class="text-xl text-red-400 animate-pulse">Resolving location...</p>
            }
            @case ('loading') {
              <p class="text-xl text-red-400 animate-pulse">Querying stellar orbital data...</p>
            }
            @case ('error') {
              <div class="text-center">
                <p class="text-xl font-bold text-yellow-500">Error</p>
                <p class="text-yellow-400/80">{{ errorMessage() }}</p>
              </div>
            }
            @case ('success') {
               <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                <!-- Star Chart -->
                <div class="order-last lg:order-first">
                  <app-star-chart [positions]="celestialData()!"></app-star-chart>
                </div>

                <!-- Data Grid -->
                <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  @for (body of celestialData(); track body.name) {
                    <div class="border border-red-900/80 bg-black/40 rounded-md p-3">
                      <h4 class="text-xl font-bold text-red-400 capitalize border-b border-red-800 pb-1 mb-2">{{ body.name }}</h4>
                      <div class="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p class="font-bold text-red-300">RA</p>
                          <p class="text-red-300/80 font-mono">{{ body.ra }}</p>
                        </div>
                        <div>
                          <p class="font-bold text-red-300">Dec</p>
                          <p class="text-red-300/80 font-mono">{{ body.dec }}</p>
                        </div>
                        <div>
                          <p class="font-bold text-red-300">Altitude</p>
                          <p class="text-red-300/80 font-mono">{{ body.altitude.toFixed(2) }}&deg;</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StarChartComponent]
})
export class CelestialTrackerComponent {
  private astronomyService = inject(AstronomyService);
  private geocodingService = inject(GeocodingService);

  initialLocation = input<{ lat: number, lng: number } | null>(null);

  status = signal<Status>('idle');
  celestialData = signal<CelestialPosition[] | null>(null);
  errorMessage = signal<string | null>(null);
  
  locationQuery = signal('Los Angeles, CA');
  resolvedCoordinates = signal<{ lat: number, lon: number } | null>(null);
  
  // Default to current UTC date and time
  date = signal(new Date().toISOString().split('T')[0]);
  time = signal(new Date().toISOString().split('T')[1].substring(0, 5));
  
  constructor() {
    if (!this.astronomyService.areCredentialsConfigured()) {
      this.status.set('unconfigured');
    }

    // Effect to react to location selections from the map component
    effect(() => {
      const loc = this.initialLocation();
      if (loc) {
        this.locationQuery.set(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        this.resolvedCoordinates.set(null); // Clear previous resolved name
        this.fetchPositions();
      }
    });
  }

  async fetchPositions() {
    // 1. Reset state before starting
    this.status.set('loading');
    this.celestialData.set(null);
    this.errorMessage.set(null);
    
    // 2. Validate inputs
    const query = this.locationQuery().trim();
    if (!query) {
      this.errorMessage.set('Location input is required. Please enter a location.');
      this.status.set('error');
      return;
    }
    const timestamp = new Date(`${this.date()}T${this.time()}:00Z`);
    if (isNaN(timestamp.getTime())) {
      this.errorMessage.set('The selected date or time is invalid. Please check your input.');
      this.status.set('error');
      return;
    }

    let coords: { lat: number; lon: number };

    // 3. Geocode location (if necessary)
    try {
      const queryParts = query.split(',').map(p => p.trim());
      if (queryParts.length === 2 && !isNaN(parseFloat(queryParts[0])) && !isNaN(parseFloat(queryParts[1]))) {
        coords = { lat: parseFloat(queryParts[0]), lon: parseFloat(queryParts[1]) };
        this.resolvedCoordinates.set(null); // Raw coordinates, no name to show
      } else {
        this.status.set('geocoding');
        const geoResult = await this.geocodingService.geocode(query);
        if (!geoResult) {
          throw new Error(`Could not resolve location: "${query}". Please be more specific.`);
        }
        coords = { lat: parseFloat(geoResult.lat), lon: parseFloat(geoResult.lon) };
        this.resolvedCoordinates.set(coords);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      this.errorMessage.set(`Geocoding Error: ${message}`);
      this.status.set('error');
      return;
    }

    // 4. Fetch celestial data from Astronomy API
    this.status.set('loading');
    try {
      const bodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
      const results = await this.astronomyService.getBodyPositions(coords.lat, coords.lon, 0, timestamp, bodies);
      
      if (results.length === 0) {
        throw new Error('API returned no data for the specified parameters. This could be a temporary issue.');
      }
      
      this.celestialData.set(results);
      this.status.set('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown API error occurred.';
      this.errorMessage.set(`Astronomy API Error: ${message}`);
      this.status.set('error');
    }
  }
}
