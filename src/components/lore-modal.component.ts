
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constellation } from '../services/constellation.service';

@Component({
  selector: 'app-lore-modal',
  template: `
    @if(constellation(); as c) {
      <div (click)="onBackdropClick($event)" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div class="w-full max-w-2xl border-2 border-red-700 bg-black p-6 rounded-lg shadow-lg shadow-red-900/50 relative animate-slide-up">
          <button (click)="closeModal.emit()" class="absolute top-2 right-3 text-red-500 hover:text-red-300 transition-colors text-3xl font-bold">&times;</button>
          
          <h3 class="text-3xl font-bold text-red-500 tracking-wider mb-4 pr-8">{{ c.name }}</h3>
          
          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <h4 class="font-semibold text-red-400 border-b border-red-800 pb-1 mb-2">Mythology</h4>
              <p class="text-red-300/90 text-sm leading-relaxed">{{ c.myth }}</p>
            </div>
            <div>
              <h4 class="font-semibold text-red-400 border-b border-red-800 pb-1 mb-2">Pro Tip</h4>
              <p class="text-red-300/90 text-sm leading-relaxed">{{ c.pro_tip }}</p>
            </div>
          </div>
        </div>
      </div>
      <style>
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class LoreModalComponent {
  constellation = input<Constellation | null>(null);
  closeModal = output<void>();

  onBackdropClick(event: MouseEvent) {
    // Close modal only if the backdrop itself is clicked, not the content inside
    if (event.currentTarget === event.target) {
      this.closeModal.emit();
    }
  }
}
