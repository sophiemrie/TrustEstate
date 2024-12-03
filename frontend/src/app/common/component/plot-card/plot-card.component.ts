import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Plot } from '../../type/plot.type';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-plot-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './plot-card.component.html',
  styleUrl: './plot-card.component.scss'
})
export class PlotCardComponent {
  plot = input.required<Plot>();
}
