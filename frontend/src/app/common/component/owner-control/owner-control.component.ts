import { Component, computed, effect, model, ModelSignal, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Ownership } from '../../type/ownership.type';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-owner-control',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './owner-control.component.html',
  styleUrl: './owner-control.component.scss'
})
export class OwnerControlComponent {
  owners: ModelSignal<Ownership[]> = model.required<Ownership[]>();

  dataSource = new MatTableDataSource<Ownership>([]);
  displayedColumns = ['owner', 'share', 'actions'];
  form = new FormGroup({
    owner: new FormControl(''),
    share: new FormControl(0)
  });

  constructor() {
    effect(() => this.dataSource.data = this.owners());
  }

  addOwner() {
    console.log(this.form.value);
    this.owners.update(owners => {
      const owner = this.form.value.owner;
      const share = this.form.value.share;

      if(!owner || !share) return owners;

      return [...owners, { owner, share }];
    });
    this.form.reset();
  }

  removeOwner(owner: Ownership) {
    this.owners.update(owners => owners.filter(o => o !== owner));
  }
}
