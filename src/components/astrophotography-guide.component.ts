import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AstrophotographyGuideService, AstroSubject, CameraSettings, CalibrationFrameGuide } from '../services/astrophotography-guide.service';

// To use the 'marked' library from the CDN
declare var marked: { parse: (markdown: string) => string; };

@Component({
  selector: 'app-astrophotography-guide',
  template: `
    <div class="border-2 border-red-900 bg-black/60 p-4 sm:p-6 rounded-lg shadow-lg shadow-red-900/20">
      <!-- Header and Filters -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 class="text-2xl text-center font-semibold">Astrophotography Settings Guide</h2>
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Mode Toggle -->
          <div class="flex items-center gap-2 p-2 border border-red-700/50 rounded-lg bg-black/50">
            <span class="font-bold uppercase tracking-wider text-sm">Mode:</span>
            <button (click)="selectedMode.set('tripod')" [class]="'px-3 py-1 rounded-md transition-colors duration-300 text-sm ' + (selectedMode() === 'tripod' ? 'bg-red-700 text-black font-bold' : 'bg-red-900/50 hover:bg-red-800/70 text-red-300')">
              Tripod-Only
            </button>
            <button (click)="selectedMode.set('tracker')" [class]="'px-3 py-1 rounded-md transition-colors duration-300 text-sm ' + (selectedMode() === 'tracker' ? 'bg-red-700 text-black font-bold' : 'bg-red-900/50 hover:bg-red-800/70 text-red-300')">
              Star Tracker
            </button>
          </div>
          <!-- Subject Selector -->
          <select [value]="selectedSubjectId()" (change)="selectedSubjectId.set($event.target.value)" class="bg-black border border-red-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
            @for(subject of subjects(); track subject.id) {
              <option [value]="subject.id">{{ subject.name }}</option>
            }
          </select>
        </div>
      </div>
      
      <!-- User Equipment Section -->
      <div class="my-6 border-y-2 border-red-900/50 py-4">
        <button (click)="isEquipmentVisible.set(!isEquipmentVisible())" class="w-full text-left text-lg font-semibold text-red-400 hover:text-red-300 transition-colors p-2 rounded-md">
            <span class="mr-2">{{ isEquipmentVisible() ? '▼' : '►' }}</span>
            Personalize Recommendations (My Equipment)
        </button>
        @if (isEquipmentVisible()) {
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 px-2 animate-fade-in">
                <!-- Camera Sensor -->
                <div>
                    <label for="sensorType" class="text-sm font-bold text-red-300 block mb-1">Camera Sensor Type</label>
                    <select id="sensorType" [value]="sensorType()" (change)="sensorType.set($event.target.value)" class="w-full bg-black border border-red-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
                        <option value="full_frame">Full Frame</option>
                        <option value="apsc">APS-C (Crop)</option>
                        <option value="mft">Micro Four Thirds</option>
                    </select>
                </div>
                <!-- Focal Length -->
                <div>
                    <label for="focalLength" class="text-sm font-bold text-red-300 block mb-1">Lens Focal Length (mm)</label>
                    <input id="focalLength" type="number" [value]="focalLength() ?? ''" (input)="setFocalLength($event)" placeholder="e.g., 24" class="w-full bg-black border border-red-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
                </div>
                <!-- Max Aperture -->
                <div>
                    <label for="maxAperture" class="text-sm font-bold text-red-300 block mb-1">Lens Max Aperture (f/)</label>
                    <input id="maxAperture" type="number" [value]="maxAperture() ?? ''" (input)="setMaxAperture($event)" placeholder="e.g., 1.8" step="0.1" class="w-full bg-black border border-red-700/50 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600">
                </div>
            </div>
        }
      </div>

      <!-- Settings Display -->
      @if (selectedSubject(); as subject) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recommended Settings Card -->
          <div class="border border-red-800/50 bg-black/40 rounded-lg p-4">
            <h3 class="text-xl font-bold text-red-400 mb-3 border-b border-red-800 pb-2">Recommended Settings</h3>
            @if (currentSettings(); as settings) {
              @if(settings.notes !== 'N/A') {
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div class="font-bold text-red-300">Aperture (F-Stop):</div> <div class="text-red-300/80">{{ settings.aperture }}</div>
                  <div class="font-bold text-red-300">Exposure Time:</div> <div class="text-red-300/80">{{ settings.exposure }}</div>
                  <div class="font-bold text-red-300">ISO:</div> <div class="text-red-300/80">{{ settings.iso }}</div>
                  <div class="font-bold text-red-300">White Balance:</div> <div class="text-red-300/80">{{ settings.whiteBalance }}</div>
                  <div class="font-bold text-red-300">Shutter Timer:</div> <div class="text-red-300/80">{{ settings.timer }}</div>
                </div>
                @if (settings.notes) {
                    <p class="mt-4 text-xs text-red-400/70 border-t border-red-800/50 pt-2" [innerHTML]="sanitizeNotes(settings.notes)"></p>
                }
              } @else {
                <p class="text-red-400/80">{{ subject.tracker.notes }}</p>
              }
            }
          </div>
          
          <!-- Intervalometer Card -->
          <div class="border border-red-800/50 bg-black/40 rounded-lg p-4">
            <h3 class="text-xl font-bold text-red-400 mb-3 border-b border-red-800 pb-2">Intervalometer & Bulb Mode</h3>
            <p class="text-sm text-red-300/90 leading-relaxed">{{ subject.intervalometer }}</p>
          </div>
        </div>
      }

      <!-- Calibration Guide Section -->
      <div class="mt-6 border-t-2 border-red-900 pt-4">
          <button (click)="isCalibrationVisible.set(!isCalibrationVisible())" class="w-full text-left text-xl font-semibold text-red-500 hover:text-red-400 transition-colors p-2 rounded-md">
            <span class="mr-2">{{ isCalibrationVisible() ? '▼' : '►' }}</span>
            How to Use Calibration Frames
          </button>
          @if (isCalibrationVisible()) {
            <div class="mt-4 space-y-4 pl-4 animate-fade-in">
              @for(guide of calibrationGuide(); track guide.title) {
                <div class="prose text-sm" [innerHTML]="guide.content"></div>
              }
            </div>
          }
      </div>
    </div>
    <!-- Custom styles for rendering markdown content -->
    <style>
      .prose { max-width: 100%; color: rgba(252, 165, 165, 0.9); }
      .prose h3 { color: #f87171; margin-bottom: 0.5em; font-size: 1.1em; }
      .prose p, .prose ul { margin-top: 0; margin-bottom: 1em; }
      .prose strong { color: #fca5a5; }
      .prose ul { padding-left: 1.5em; list-style-type: disc; }
      .prose li { margin-bottom: 0.25em; }
      .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AstrophotographyGuideComponent implements OnInit {
  private guideService = inject(AstrophotographyGuideService);
  private sanitizer = inject(DomSanitizer);

  // Component state
  subjects = signal<AstroSubject[]>([]);
  selectedSubjectId = signal<string>('');
  selectedMode = signal<'tripod' | 'tracker'>('tripod');
  isCalibrationVisible = signal(false);
  isEquipmentVisible = signal(false);
  rawCalibrationGuide = signal<CalibrationFrameGuide[]>([]);
  
  // User equipment state
  sensorType = signal<'full_frame' | 'apsc' | 'mft'>('full_frame');
  focalLength = signal<number | null>(null);
  maxAperture = signal<number | null>(null);

  // Computed properties
  calibrationGuide = computed(() => {
    return this.rawCalibrationGuide().map(guide => ({
        title: guide.title,
        content: this.parseMarkdown(guide.content)
    }));
  });

  selectedSubject = computed(() => {
    const id = this.selectedSubjectId();
    if (!id) return null;
    return this.subjects().find(s => s.id === id) ?? null;
  });

  currentSettings = computed<CameraSettings | null>(() => {
    const subject = this.selectedSubject();
    if (!subject) return null;

    const baseSettings = this.selectedMode() === 'tripod' ? subject.tripod : subject.tracker;
    if (!baseSettings || baseSettings.notes === 'N/A') {
        return baseSettings;
    }

    // Create a mutable copy to personalize
    let personalizedSettings = { ...baseSettings };
    let notes = [baseSettings.notes || ''];

    const userFocalLength = this.focalLength();
    const userSensor = this.sensorType();
    const userAperture = this.maxAperture();

    // Personalize Aperture based on user input
    if (userAperture) {
        personalizedSettings.aperture = `f/${userAperture} (Your widest)`;
    }

    // Personalize Exposure for Tripod mode using the 500 Rule (most relevant for wide-field)
    if (this.selectedMode() === 'tripod' && subject.id === 'milkyway' && userFocalLength && userSensor && userFocalLength > 0) {
        const CROP_FACTORS = {
            'full_frame': 1,
            'apsc': 1.5,
            'mft': 2
        };
        const cropFactor = CROP_FACTORS[userSensor];
        const maxExposure = 500 / (userFocalLength * cropFactor);

        personalizedSettings.exposure = `${Math.round(maxExposure)} seconds (Max)`;
        notes.push(`<br><strong>Personalized Tip:</strong> Exposure is calculated with the 500 Rule for your ${userFocalLength}mm lens on a ${userSensor.replace('_', '-')} sensor.`);

        // Suggest ISO adjustment based on new exposure time
        if (maxExposure < 15) {
            personalizedSettings.iso = "6400 or higher";
        } else if (maxExposure < 25) {
             personalizedSettings.iso = "3200-6400";
        } else {
            personalizedSettings.iso = "1600-3200";
        }
    }
    
    personalizedSettings.notes = notes.filter(n => n).join(' ');
    
    return personalizedSettings;
  });

  // Lifecycle
  ngOnInit() {
    const subjects = this.guideService.getSubjects();
    this.subjects.set(subjects);
    if (subjects.length > 0) {
      this.selectedSubjectId.set(subjects[0].id);
    }
    this.rawCalibrationGuide.set(this.guideService.getCalibrationGuide());
  }
  
  // Event handlers for equipment inputs
  setFocalLength(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.focalLength.set(value ? parseInt(value, 10) : null);
  }

  setMaxAperture(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.maxAperture.set(value ? parseFloat(value) : null);
  }

  // Sanitization and parsing
  sanitizeNotes(notes: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(notes);
  }

  private parseMarkdown(content: string): SafeHtml {
    if (content && typeof marked !== 'undefined') {
        let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/\* (.*?)(<br>|$)/g, '<li>$1</li>');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
