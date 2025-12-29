
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constellation } from '../services/constellation.service';

@Component({
  selector: 'app-constellation-card',
  template: `
    @if (constellation(); as c) {
      <div class="h-full border-2 border-red-900 bg-black/60 p-6 rounded-lg shadow-lg shadow-red-900/20 flex flex-col gap-4 transition-transform duration-300 hover:scale-105 hover:border-red-700">
        <h3 class="text-2xl font-bold text-red-500 tracking-wider">{{ c.name }}</h3>
        
        <div>
          <h4 class="font-semibold text-red-400 border-b border-red-800 pb-1 mb-2">Mythology</h4>
          <p class="text-red-300/90 text-sm leading-relaxed">{{ c.myth }}</p>
        </div>

        <div>
          <h4 class="font-semibold text-red-400 border-b border-red-800 pb-1 mb-2">Pro Tip</h4>
          <p class="text-red-300/90 text-sm leading-relaxed">{{ c.pro_tip }}</p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ConstellationCardComponent {
  constellation = input.required<Constellation>();
}
