import { Component, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogClose } from '@angular/material/dialog';
import { OwnerControlComponent } from '../owner-control/owner-control.component';
import { Ownership } from '../../type/ownership.type';

@Component({
  selector: 'app-create-transfer-proposal-modal',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDialogTitle,
    MatDialogClose,
    OwnerControlComponent,
  ],
  templateUrl: './create-transfer-proposal-modal.component.html',
  styleUrl: './create-transfer-proposal-modal.component.scss'
})
export class CreateTransferProposalModalComponent {
  public owners: WritableSignal<Ownership[]> = signal([])

  constructor(
    public dialogRef: MatDialogRef<CreateTransferProposalModalComponent>,
  ) { }

  onSubmitClick() {
    this.dialogRef.close(this.owners());
  }
}
