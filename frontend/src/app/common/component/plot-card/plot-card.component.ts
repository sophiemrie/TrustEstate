import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Plot } from '../../type/plot.type';
import { MatIconModule } from '@angular/material/icon';
import { Ownership } from '../../type/ownership.type';
import { PlotOwnersTableComponent } from '../plot-owners-table/plot-owners-table.component';

@Component({
  selector: 'app-plot-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    PlotOwnersTableComponent,
  ],
  templateUrl: './plot-card.component.html',
  styleUrl: './plot-card.component.scss'
})
export class PlotCardComponent {
  plot = input.required<Plot>();
  owners = input.required<Ownership[]>();
}
