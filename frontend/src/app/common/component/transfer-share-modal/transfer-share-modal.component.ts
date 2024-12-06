import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-transfer-share-modal',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogClose,
  ],
  templateUrl: './transfer-share-modal.component.html',
  styleUrl: './transfer-share-modal.component.scss'
})
export class TransferShareModalComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TransferShareModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { amount: number, to: string }
  ) {

    this.form = new FormGroup({
      amount: new FormControl(data.amount),
      to: new FormControl(data.to),
    });
  }

  onSubmitClick() {
    this.dialogRef.close(this.form.value);
  }
}
