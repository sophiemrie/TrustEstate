import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EthereumService } from '../../service/ethereum.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register-control',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './register-control.component.html',
  styleUrl: './register-control.component.scss'
})
export class RegisterControlComponent {
  form = new FormGroup({
    did: new FormControl(''),
  });

  constructor(
    private ethereumService: EthereumService,
  ) { }

  async register() {
    if (!this.form.value.did) return;
    await this.ethereumService.register(this.form.value.did);
    this.form.reset();
  }

}
