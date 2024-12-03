import { Component } from '@angular/core';
import { PlotComponent } from '../../common/component/plot/plot.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PlotComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
}
