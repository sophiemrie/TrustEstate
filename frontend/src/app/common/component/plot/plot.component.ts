import { Component, signal, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EthereumService } from '../../service/ethereum.service';
import { Plot } from '../../type/plot.type';
import { PlotCardComponent } from '../plot-card/plot-card.component';
import { Ownership } from '../../type/ownership.type';

@Component({
  selector: 'app-plot',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    PlotCardComponent,
  ],
  templateUrl: './plot.component.html',
  styleUrl: './plot.component.scss'
})
export class PlotComponent {
  plot = signal<Plot | undefined>(undefined);
  owners = signal<Ownership[] | undefined>(undefined);

  plotId = signal<number | undefined>(undefined);

  constructor(
    private ethereumService: EthereumService
  ) {
    effect((onCleanup) => {
      const plotId = this.plotId();

      if (plotId === undefined) return;
      const timer = setTimeout(async () => {
        await this.getPlot(plotId);
      }, 200);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }

  onPlotChange(event: any) {
    if (!event.target?.value) {
      this.plotId.set(undefined);
      return;
    }

    this.plotId.set(event.target.value);
  }

  async getPlot(plotId: number) {
    this.plot.set(await this.ethereumService.getPlot(plotId));
    this.owners.set(await this.ethereumService.getOwnership(plotId));
  }
}
