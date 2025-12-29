import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unconfigured';

// To use the 'marked' library from the CDN
declare var marked: { parse: (markdown: string) => string; };

@Component({
  selector: 'app-stargazing-companion',
  template: `
    <div class="border-2 border-red-900 bg-black/60 p-4 sm:p-6 rounded-lg shadow-lg shadow-red-900/20">

      @if (status() === 'unconfigured') {
        <div class="h-48 flex flex-col items-center justify-center text-center p-4">
           <h3 class="text-2xl font-bold text-yellow-500">Feature Unavailable</h3>
           <p class="text-yellow-300/80 mt-2">The Gemini API key is not configured. This feature requires a valid API key to function.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          <p class="text-center text-red-400/80">Describe what you see in the sky, and our AI companion will help you identify it.</p>
          
          <!-- Input Form -->
          <textarea 
            [value]="prompt()"
            (input)="prompt.set($event.target.value)"
            rows="3" 
            placeholder="e.g., 'I see a bright red star to the left of the moon' or 'a W-shaped group of stars'"
            class="w-full bg-black border border-red-800 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-base resize-y"
          ></textarea>
          
          <button
            (click)="getInfo()"
            [disabled]="status() === 'loading' || !prompt().trim()"
            class="w-full px-4 py-2 rounded-md transition-colors duration-300 text-lg font-bold bg-red-900/80 hover:bg-red-800/90 text-red-200 disabled:bg-red-900/40 disabled:cursor-not-allowed disabled:text-red-200/50"
          >
            @if (status() === 'loading') {
              <span class="animate-pulse">Consulting the cosmos...</span>
            } @else {
              <span>Get Info</span>
            }
          </button>

          <!-- Results Display -->
          <div class="min-h-[100px] p-4 bg-black/50 border border-red-800/50 rounded-lg flex items-center justify-center">
            @switch (status()) {
              @case ('idle') {
                <p class="text-red-400/70">Awaiting your observation...</p>
              }
              @case ('loading') {
                <p class="text-xl text-red-400 animate-pulse">Analyzing celestial patterns...</p>
              }
              @case ('error') {
                <div class="text-center">
                  <p class="text-xl font-bold text-yellow-500">Error</p>
                  <p class="text-yellow-400/80">{{ errorMessage() }}</p>
                </div>
              }
              @case ('success') {
                <div class="w-full text-left">
                  <div 
                    class="prose" 
                    [innerHTML]="responseHtml()">
                  </div>
                  <div class="mt-4 pt-2 border-t border-red-800/50 text-right text-xs text-red-500/60 flex items-center justify-end gap-2">
                    <span>Powered by</span>
                    <img src="https://www.gstatic.com/lamda/images/gemini_wordmark_2023_white_l_v1.svg" alt="Gemini" class="h-4 opacity-70">
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }

    </div>
    <!-- Custom styles for rendering markdown content -->
    <style>
      .prose { max-width: 100%; color: rgba(252, 165, 165, 0.9); }
      .prose h1, .prose h2, .prose h3 { color: #ef4444; margin-bottom: 0.5em; margin-top: 1em;}
      .prose p { margin-top: 0; margin-bottom: 1em; }
      .prose strong { color: #fca5a5; }
      .prose ul { margin-top: 0; margin-bottom: 1em; padding-left: 1.5em; list-style-type: disc; }
      .prose ul > li { margin-top: 0; margin-bottom: 0.25em; }
      .prose a { color: #f87171; text-decoration: underline; }
      .prose a:hover { color: #ef4444; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StargazingCompanionComponent {
  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);

  prompt = signal('');
  response = signal<string | null>(null);
  errorMessage = signal('');
  status = signal<Status>('idle');

  responseHtml = computed<SafeHtml | null>(() => {
    const markdown = this.response();
    if (markdown && typeof marked !== 'undefined') {
      try {
        return this.sanitizer.bypassSecurityTrustHtml(marked.parse(markdown));
      } catch (e) {
        console.error('Error parsing markdown:', e);
        // Fallback to plain text if markdown parsing fails
        const pre = document.createElement('pre');
        pre.textContent = markdown;
        return this.sanitizer.bypassSecurityTrustHtml(pre.outerHTML);
      }
    }
    return null;
  });

  constructor() {
    if (!this.geminiService.isConfigured()) {
      this.status.set('unconfigured');
    }
  }

  async getInfo() {
    if (!this.prompt().trim()) return;

    this.status.set('loading');
    this.response.set(null);
    this.errorMessage.set('');

    try {
      const result = await this.geminiService.generateContent(this.prompt());
      this.response.set(result);
      this.status.set('success');
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'An unknown error occurred.');
      this.status.set('error');
    }
  }
}
