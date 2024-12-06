import { Component, Inject, signal, WritableSignal } from '@angular/core';
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
  selector: 'app-create-merge-proposal-modal',
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
  templateUrl: './create-merge-proposal-modal.component.html',
  styleUrl: './create-merge-proposal-modal.component.scss'
})
export class CreateMergeProposalModalComponent {

  owners: WritableSignal<Ownership[]> = signal([]);

  form = new FormGroup({
    ipfsHash: new FormControl(''),
    allowIndividualTransfer: new FormControl(true),
    plotId: new FormControl(null),
  });

  constructor(
    public dialogRef: MatDialogRef<CreateMergeProposalModalComponent>,
  ) { }

  onSubmitClick() {
    this.dialogRef.close({
      ...this.form.value,
      owners: this.owners(),
    });
  }

}
