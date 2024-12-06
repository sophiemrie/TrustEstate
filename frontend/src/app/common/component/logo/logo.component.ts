import { Component, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  colorScheme = signal('light');

  constructor(mediaMatcher: MediaMatcher) {
    const mediaQueryList = mediaMatcher.matchMedia('(prefers-color-scheme: dark)');

    // Initialize the signal with the current preference
    this.colorScheme = signal(mediaQueryList.matches ? 'dark' : 'light');

    // Listen for changes in the media query and update the signal
    mediaQueryList.addEventListener('change', (event) => {
      this.colorScheme.set(event.matches ? 'dark' : 'light');
    });

  }


}
