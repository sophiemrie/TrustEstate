import { Component } from '@angular/core';
import { PlotComponent } from '../../common/component/plot/plot.component';
import { LogoComponent } from '../../common/component/logo/logo.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PlotComponent,
    LogoComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
}
