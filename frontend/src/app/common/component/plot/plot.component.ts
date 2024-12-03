import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EthereumService } from '../../service/ethereum.service';
import { Plot } from '../../type/plot.type';
import { PlotCardComponent } from '../plot-card/plot-card.component';

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
  plotFormControl = new FormControl<number | null>(null);

  currentPlot = signal<Plot | undefined>(undefined);

  constructor(
    private ethereumService: EthereumService
  ) { }

  async getPlot() {
    // check if plot Form value is a number
    if (this.plotFormControl.value === undefined || this.plotFormControl.value === null) return;

    this.currentPlot.set(await this.ethereumService.getPlot(this.plotFormControl.value));
    console.log(this.currentPlot());
  }
}
