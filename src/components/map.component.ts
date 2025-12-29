import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Data structure for the Bortle class information
interface BortleInfo {
  lat: number;
  lng: number;
  bortleClass: number;
  description: string;
  recommendation: string;
}

// Data structure for mock city data to simulate light pollution
interface City {
  name: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-map',
  template: `
    <div class="border-2 border-red-900 bg-black/60 p-4 rounded-lg shadow-lg shadow-red-900/20">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Map container -->
        <div 
          class="w-full h-96 md:h-[500px] flex-grow rounded-md border-2 border-red-800 relative bg-black overflow-hidden"
          [class.cursor-grab]="mapStatus() === 'ok'"
          (wheel)="handleWheel($event)"
          (mousedown)="handleMouseDown($event)"
          (mousemove)="handleMouseMove($event)"
          (mouseup)="handleMouseUp($event)"
          (mouseleave)="handleMouseLeave($event)">
          
          @if (mapStatus() === 'ok') {
            <img 
              src="https://raw.githubusercontent.com/google-gemini/angular-starmap/main/docs/starmap.png"
              alt="Star map placeholder"
              class="w-full h-full object-cover pointer-events-none origin-center"
              [style.transform]="mapTransform()"
              style="will-change: transform;"
              (error)="onImageError()"
            />
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p class="text-2xl text-red-500/50 font-bold p-4 bg-black/50 rounded-lg select-none">MAP SIMULATION</p>
            </div>
            <!-- UI Controls for Zoom/Pan -->
            <div class="absolute top-2 right-2 flex flex-col gap-2">
              <button (click)="zoomIn()" title="Zoom In" class="w-8 h-8 bg-black/70 border border-red-800 rounded text-red-400 hover:bg-red-900/80 font-bold text-lg">+</button>
              <button (click)="zoomOut()" title="Zoom Out" class="w-8 h-8 bg-black/70 border border-red-800 rounded text-red-400 hover:bg-red-900/80 font-bold text-lg">-</button>
              <button (click)="resetMap()" title="Reset View" class="w-8 h-8 bg-black/70 border border-red-800 rounded text-red-400 hover:bg-red-900/80 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"/></svg>
              </button>
            </div>
            <div class="absolute bottom-2 left-2 text-xs text-red-500/50 bg-black/50 p-1 rounded select-none">Scroll to zoom, Drag to pan</div>
          } @else {
            <div class="w-full h-full flex items-center justify-center bg-black/50">
                <div class="text-center p-4">
                    <p class="font-bold text-yellow-500">Map Unavailable</p>
                    <p class="text-yellow-400/80 text-sm">The light pollution map image could not be loaded.</p>
                </div>
            </div>
          }
        </div>
        
        <!-- Info Panel -->
        <div class="md:w-80 flex-shrink-0 flex flex-col gap-4">
          <div class="border border-red-800 rounded-lg p-4 bg-black/50 text-center h-full flex flex-col">
            <h3 class="text-xl font-bold text-red-500 mb-2">Bortle Class Finder</h3>
            <p class="text-sm text-red-400/80 mb-4">Click the map or use your location to estimate sky quality.</p>
             <button 
                (click)="useMyLocation()" 
                [disabled]="infoPanelStatus() === 'loading-geo'"
                class="w-full px-4 py-2 rounded-md transition-colors duration-300 font-bold bg-red-900/80 hover:bg-red-800/90 text-red-200 disabled:bg-red-900/40 disabled:cursor-not-allowed">
                @if (infoPanelStatus() === 'loading-geo') {
                    <span class="animate-pulse">Locating...</span>
                } @else {
                    <span>Use My Location</span>
                }
            </button>
            <div class="flex-grow mt-4 flex items-center justify-center">
              @if (infoPanelStatus() === 'geo-error') {
                  <div class="text-center">
                      <p class="font-bold text-yellow-500">Location Error</p>
                      <p class="text-yellow-400/80 text-sm">{{ geoErrorMessage() }}</p>
                  </div>
              } @else if (bortleInfo(); as info) {
                <div class="text-left animate-fade-in w-full">
                  <p class="text-2xl font-bold text-center text-red-400 mb-2">Class {{ info.bortleClass }}</p>
                  <p class="text-lg font-semibold text-center text-red-300 mb-3">{{ info.description }}</p>
                  <p class="text-sm text-red-300/90 leading-relaxed"><span class="font-bold text-red-400">Recommendation:</span> {{ info.recommendation }}</p>
                  <p class="text-xs text-red-500/70 mt-3 text-center">Simulated Lat: {{ info.lat.toFixed(2) }}, Lng: {{ info.lng.toFixed(2) }}</p>
                </div>
              } @else {
                <p class="text-red-400">Awaiting selection...</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
     <style>
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class MapComponent {
  locationSelected = output<{ lat: number, lng: number }>();
  
  bortleInfo = signal<BortleInfo | null>(null);
  mapStatus = signal<'ok' | 'image-error'>('ok');
  infoPanelStatus = signal<'idle' | 'loading-geo' | 'geo-error'>('idle');
  geoErrorMessage = signal('');

  // Signals for pan and zoom state
  zoom = signal(1);
  pan = signal({ x: 0, y: 0 });
  isPanning = signal(false);

  // Private properties for tracking pan gesture
  private startPanPosition = { x: 0, y: 0 };
  private initialPan = { x: 0, y: 0 };

  // Computed transform style for the map image
  mapTransform = computed(() => {
    const { x, y } = this.pan();
    const scale = this.zoom();
    return `scale(${scale.toFixed(4)}) translate(${x.toFixed(4)}px, ${y.toFixed(4)}px)`;
  });

  // UI control methods
  zoomIn() {
    this.zoom.update(z => Math.min(z * 1.25, 5));
  }
  
  zoomOut() {
    this.zoom.update(z => Math.max(z / 1.25, 1));
  }

  resetMap() {
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
  }

  onImageError() {
    this.mapStatus.set('image-error');
  }

  useMyLocation() {
    if (navigator.geolocation) {
      this.infoPanelStatus.set('loading-geo');
      this.geoErrorMessage.set('');
      this.bortleInfo.set(null); // Clear previous result
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.bortleInfo.set(this.getMockBortleClass(latitude, longitude));
          this.locationSelected.emit({ lat: latitude, lng: longitude });
          this.infoPanelStatus.set('idle');
        },
        (error) => {
          this.infoPanelStatus.set('geo-error');
          this.geoErrorMessage.set(`Geolocation Error: ${error.message}`);
        },
        { timeout: 10000 } // Add a timeout for better UX
      );
    } else {
      this.infoPanelStatus.set('geo-error');
      this.geoErrorMessage.set('Geolocation is not supported by your browser.');
    }
  }

  // Mouse event handlers for pan and zoom
  handleWheel(event: WheelEvent) {
    if (this.mapStatus() !== 'ok') return;
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.zoom.update(z => Math.max(1, Math.min(z * zoomFactor, 5)));
  }

  handleMouseDown(event: MouseEvent) {
    if (this.mapStatus() !== 'ok') return;
    event.preventDefault();
    this.isPanning.set(true);
    this.startPanPosition = { x: event.clientX, y: event.clientY };
    this.initialPan = this.pan();
    (event.currentTarget as HTMLElement).style.cursor = 'grabbing';
  }

  handleMouseMove(event: MouseEvent) {
    if (!this.isPanning()) return;
    const dx = event.clientX - this.startPanPosition.x;
    const dy = event.clientY - this.startPanPosition.y;
    this.pan.set({
      x: this.initialPan.x + (dx / this.zoom()),
      y: this.initialPan.y + (dy / this.zoom())
    });
  }
  
  handleMouseUp(event: MouseEvent) {
    if (this.mapStatus() !== 'ok') return;
    const target = event.currentTarget as HTMLElement;
    target.style.cursor = 'grab';
    if (!this.isPanning()) return;
    
    this.isPanning.set(false);
    const dx = event.clientX - this.startPanPosition.x;
    const dy = event.clientY - this.startPanPosition.y;
    const distSq = dx * dx + dy * dy;
    
    // If the mouse moved less than 5px, treat it as a click
    if (distSq < 25) { 
      this.onMapClick(event);
    }
  }

  handleMouseLeave(event: MouseEvent) {
    if (this.isPanning()) {
        this.isPanning.set(false);
        (event.currentTarget as HTMLElement).style.cursor = 'grab';
    }
  }

  private onMapClick(event: MouseEvent) {
    this.infoPanelStatus.set('idle');
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normX = x / rect.width;
    const normY = y / rect.height;

    const lat = 90 - (normY * 180);
    const lng = -180 + (normX * 360);
    
    this.locationSelected.emit({ lat, lng });
    this.bortleInfo.set(this.getMockBortleClass(lat, lng));
  }

  private getMockBortleClass(lat: number, lng: number): BortleInfo {
    const cities: City[] = [
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
      { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
    ];

    let minDistance = Infinity;
    for (const city of cities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    let bortleClass = 1;
    if (minDistance < 0.5) bortleClass = 9;
    else if (minDistance < 1.5) bortleClass = 8;
    else if (minDistance < 3) bortleClass = 7;
    else if (minDistance < 5) bortleClass = 6;
    else if (minDistance < 8) bortleClass = 5;
    else if (minDistance < 12) bortleClass = 4;
    else if (minDistance < 20) bortleClass = 3;
    else if (minDistance < 30) bortleClass = 2;
    
    const BORTLE_DATA = [
        { class: 1, description: "Excellent Dark-Sky Site", recommendation: "The galactic core casts shadows. Ideal for observing faint objects like nebulae and galaxies." },
        { class: 2, description: "Typical Truly Dark Site", recommendation: "The Milky Way is highly structured. Excellent for all deep-sky objects. Airglow may be visible." },
        { class: 3, description: "Rural Sky", recommendation: "Some light pollution on the horizon. The Milky Way is still impressive. Good for most observing." },
        { class: 4, description: "Rural/Suburban Transition", recommendation: "Light pollution domes visible. The Milky Way is visible but lacks detail. Good for planets and bright objects." },
        { class: 5, description: "Suburban Sky", recommendation: "The Milky Way is very weak or invisible. Only bright deep-sky objects like Andromeda are visible. Focus on planets." },
        { class: 6, description: "Bright Suburban Sky", recommendation: "The sky has a reddish/grey glow. The Milky Way is lost. Limited to planets and the moon." },
        { class: 7, description: "Suburban/Urban Transition", recommendation: "Entire sky is light grey. Heavily filtered astrophotography is possible, but visual is very limited." },
        { class: 8, description: "City Sky", recommendation: "You can see the moon, planets, and a few bright star clusters. The sky glows white/orange." },
        { class: 9, description: "Inner-City Sky", recommendation: "Only the brightest stars, planets, and the Moon are visible. Sky is brilliant." },
    ];

    const data = BORTLE_DATA[bortleClass - 1];
    return { lat, lng, bortleClass, ...data };
  }
}
