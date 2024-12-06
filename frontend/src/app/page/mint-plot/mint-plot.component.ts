import { Component } from '@angular/core';
import { MintPlotControlComponent } from '../../common/component/mint-plot-control/mint-plot-control.component';

@Component({
  selector: 'app-mint-plot',
  standalone: true,
  imports: [
    MintPlotControlComponent,
  ],
  templateUrl: './mint-plot.component.html',
  styleUrl: './mint-plot.component.scss'
})
export class MintPlotComponent {

}
