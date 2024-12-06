import { Component, signal, WritableSignal } from '@angular/core';
import { OwnerControlComponent } from '../owner-control/owner-control.component';
import { Ownership } from '../../type/ownership.type';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';


@Component({
  selector: 'app-create-split-proposal-modal',
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
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
  ],
  templateUrl: './create-split-proposal-modal.component.html',
  styleUrl: './create-split-proposal-modal.component.scss'
})
export class CreateSplitProposalModalComponent {

  owners1: WritableSignal<Ownership[]> = signal([]);
  owners2: WritableSignal<Ownership[]> = signal([]);

  form = new FormGroup({
    ipfsHash1: new FormControl(''),
    allowIndividualTransfer1: new FormControl(true),

    ipfsHash2: new FormControl(''),
    allowIndividualTransfer2: new FormControl(true),
  });

  constructor(
    public dialogRef: MatDialogRef<CreateSplitProposalModalComponent>,
  ) { }

  onSubmitClick() {
    this.dialogRef.close({
      ...this.form.value,
      owners1: this.owners1(),
      owners2: this.owners2(),
    });
  }

}
