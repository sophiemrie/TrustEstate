import { Component } from '@angular/core';
import { EthereumService } from '../../common/service/ethereum.service';
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
  constructor(
    private ethereumService: EthereumService
  ) { }

  async test() {
    this.ethereumService.test();
  }

}
