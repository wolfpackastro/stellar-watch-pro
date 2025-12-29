
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapLoaderService {
  private apiLoaded = signal(false);
  
  // The API key is no longer needed for the mocked implementation.
  private readonly apiKey = '';

  load(): Promise<boolean> {
    // This is now a mock loader that doesn't load the Google Maps script.
    // It immediately resolves as successful, allowing the map component 
    // to render its simulated version without a real API key.
    if (!this.apiLoaded()) {
      this.apiLoaded.set(true);
    }
    return Promise.resolve(true);
  }
}
