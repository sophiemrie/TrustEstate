import { Component } from '@angular/core';
import { PlotComponent } from '../../common/component/plot/plot.component';

@Component({
  selector: 'app-plot-detail',
  standalone: true,
  imports: [
    PlotComponent,
  ],
  templateUrl: './plot-detail.component.html',
  styleUrl: './plot-detail.component.scss'
})
export class PlotDetailComponent {

}
