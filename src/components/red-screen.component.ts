
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-red-screen',
  template: `
    @if(isActive()) {
      <div 
        (click)="close.emit()" 
        class="fixed inset-0 bg-red-600 z-[100] flex items-center justify-center cursor-pointer animate-fade-in"
        title="Click anywhere to close">
        <div class="text-center text-black/70 font-bold">
          <p class="text-6xl">[ LAMP MODE ]</p>
          <p class="text-2xl mt-4">Click anywhere to close</p>
        </div>
      </div>
      <style>
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      </style>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class RedScreenComponent {
  isActive = input.required<boolean>();
  close = output<void>();
}
