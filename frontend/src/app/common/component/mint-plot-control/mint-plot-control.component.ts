import { Component, signal, WritableSignal } from '@angular/core';
import { OwnerControlComponent } from '../owner-control/owner-control.component';
import { Ownership } from '../../type/ownership.type';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EthereumService } from '../../service/ethereum.service';

@Component({
  selector: 'app-mint-plot-control',
  standalone: true,
  imports: [
    OwnerControlComponent,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './mint-plot-control.component.html',
  styleUrl: './mint-plot-control.component.scss'
})
export class MintPlotControlComponent {
  owners: WritableSignal<Ownership[]> = signal([]);

  form = new FormGroup({
    ipfsHash: new FormControl(''),
    allowIndividualTransfer: new FormControl(true),
  });

  constructor(
    private ethereumService: EthereumService,
  ) { }

  async mintPlot() {
    const owners = this.owners();

    if (owners.length === 0) return;
    if (!this.form.value.ipfsHash) return;
    if (this.form.value.allowIndividualTransfer === null ||
        this.form.value.allowIndividualTransfer === undefined) return;

    await this.ethereumService.mintPlot(this.owners(), this.form.value.ipfsHash, this.form.value.allowIndividualTransfer);
    this.form.reset();
  }
}
