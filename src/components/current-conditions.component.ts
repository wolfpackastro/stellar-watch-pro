import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AstronomyService, CelestialPosition } from '../services/astronomy.service';

type ConditionsStatus = 'prompting' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-current-conditions',
  template: `
    <div class="border-2 border-red-900 bg-black/60 p-4 rounded-lg shadow-lg shadow-red-900/20 min-h-[120px] flex items-center justify-center">
      @switch (status()) {
        @case ('prompting') {
          <p class="text-red-400/70 text-center">Awaiting geolocation permission to fetch current conditions...</p>
        }
        @case ('loading') {
          <p class="text-xl text-red-400 animate-pulse">Acquiring targeting data...</p>
        }
        @case ('error') {
          <div class="text-center">
            <p class="font-bold text-yellow-500">Condition Data Unavailable</p>
            <p class="text-yellow-400/80 text-sm">{{ errorMessage() }}</p>
          </div>
        }
        @case ('success') {
          <div class="w-full">
            <h3 class="text-lg font-bold text-red-500 text-center mb-3">Live Positional Data (Your Location)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              @for(body of positions(); track body.name) {
                <div class="bg-black/50 border border-red-800/50 p-2 rounded-md text-center">
                  <span class="text-lg font-bold text-red-400 capitalize">{{ body.name }}</span>
                  <div class="text-xs">
                    <p class="text-red-300 font-mono" [class.text-red-500/60]="body.altitude < 0">
                      Alt: {{ body.altitude.toFixed(1) }}&deg;
                    </p>
                    <p class="text-red-300 font-mono">
                      Az: {{ body.azimuth.toFixed(1) }}&deg;
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CurrentConditionsComponent implements OnInit {
  private astronomyService = inject(AstronomyService);
  status = signal<ConditionsStatus>('prompting');
  positions = signal<CelestialPosition[]>([]);
  errorMessage = signal('');

  ngOnInit() {
    if (!this.astronomyService.areCredentialsConfigured()) {
      this.status.set('error');
      this.errorMessage.set('AstronomyAPI not configured.');
      return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => this.handleGeoSuccess(position),
            (error) => this.handleGeoError(error)
        );
    } else {
        this.status.set('error');
        this.errorMessage.set('Geolocation is not supported by this browser.');
    }
  }

  async handleGeoSuccess(position: GeolocationPosition) {
    this.status.set('loading');
    const { latitude, longitude } = position.coords;
    try {
      const bodies = ['moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
      const results = await this.astronomyService.getBodyPositions(latitude, longitude, 0, new Date(), bodies);
      this.positions.set(results);
      this.status.set('success');
    } catch (e) {
      this.status.set('error');
      this.errorMessage.set(e instanceof Error ? e.message : 'Failed to fetch celestial data.');
    }
  }

  handleGeoError(error: GeolocationPositionError) {
    this.status.set('error');
    this.errorMessage.set(`Geolocation Error: ${error.message}.`);
  }
}
