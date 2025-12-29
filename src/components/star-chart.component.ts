import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelestialPosition } from '../services/astronomy.service';

interface PlottedBody extends CelestialPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-star-chart',
  template: `
    <div class="relative w-full aspect-square max-w-[400px] mx-auto">
      <svg viewBox="0 0 200 200" class="w-full h-full">
        <!-- Chart Background -->
        <circle cx="100" cy="100" r="100" fill="black" />

        <!-- Horizon rings (30 and 60 degrees) -->
        <circle cx="100" cy="100" r="66.6" fill="none" stroke="#ff0000" stroke-width="0.2" stroke-dasharray="1 1" opacity="0.3" />
        <circle cx="100" cy="100" r="33.3" fill="none" stroke="#ff0000" stroke-width="0.2" stroke-dasharray="1 1" opacity="0.3" />

        <!-- Horizon line -->
        <circle cx="100" cy="100" r="99" fill="none" stroke="#ff0000" stroke-width="0.5" opacity="0.7" />

        <!-- Background Stars -->
        @for (star of backgroundStars(); track $index) {
          <circle [attr.cx]="star.x" [attr.cy]="star.y" [attr.r]="star.radius" fill="#ff0000" [style.opacity]="star.opacity" />
        }

        <!-- Celestial Bodies -->
        @for (body of plottedBodies(); track body.name) {
          <g [attr.transform]="'translate(' + body.x + ',' + body.y + ')'">
            <circle cx="0" cy="0" r="2.5" fill="red" class="animate-pulse-bright" />
            <text x="4" y="1.5" font-size="5" fill="#ff4444" class="font-mono capitalize">{{ body.name }}</text>
          </g>
        }

        <!-- Cardinal Directions -->
        <text x="96" y="8" font-size="6" fill="#ff0000" opacity="0.7">N</text>
        <text x="188" y="104" font-size="6" fill="#ff0000" opacity="0.7">E</text>
        <text x="97" y="198" font-size="6" fill="#ff0000" opacity="0.7">S</text>
        <text x="2" y="104" font-size="6" fill="#ff0000" opacity="0.7">W</text>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-1 h-1 bg-red-500/70 rounded-full" title="Zenith"></div>
      </div>
       <div class="absolute bottom-1 right-2 text-xs text-red-500/50">Zenith (Center), Horizon (Edge)</div>
    </div>
    <style>
      .animate-pulse-bright {
        animation: pulse-bright 2s infinite;
      }
      @keyframes pulse-bright {
        0%, 100% { fill: #ff4444; r: 2.5; }
        50% { fill: #ffaaaa; r: 3; }
      }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StarChartComponent {
  positions = input.required<CelestialPosition[]>();

  private readonly chartSize = 200;
  private readonly center = this.chartSize / 2;
  private readonly radius = this.chartSize / 2;

  plottedBodies = computed<PlottedBody[]>(() => {
    return this.positions()
      .filter(p => p.altitude > 0) // Only show bodies above the horizon
      .map(p => {
        const r = (1 - p.altitude / 90) * this.radius;
        // Convert Azimuth (0=N, 90=E) to standard angle (0=E, 90=N) for trigonometry
        const angleRad = (p.azimuth - 90) * (Math.PI / 180);
        const x = this.center + r * Math.cos(angleRad);
        const y = this.center + r * Math.sin(angleRad);
        return { ...p, x, y };
      });
  });

  backgroundStars = computed(() => {
    const stars = [];
    // Use a simple seeded random number generator for deterministic star placement
    let seed = 1337;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const a = random() * 2 * Math.PI;
      const r = Math.sqrt(random()) * this.radius; // Uniform distribution over a circle
      const x = this.center + r * Math.cos(a);
      const y = this.center + r * Math.sin(a);
      stars.push({
        x,
        y,
        radius: 0.3 + random() * 0.4,
        opacity: 0.4 + random() * 0.5
      });
    }
    return stars;
  });
}
