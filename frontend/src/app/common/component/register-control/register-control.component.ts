import { Component, OnInit, signal } from '@angular/core';
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
export class RegisterControlComponent implements OnInit {
  isRegistered = signal(false);
  isVerified = signal(false);
  form = new FormGroup({
    did: new FormControl(''),
  });

  constructor(
    private ethereumService: EthereumService,
  ) { }

  async ngOnInit() {
    this.isRegistered.set(await this.ethereumService.isRegistered());
    this.isVerified.set(await this.ethereumService.isVerified());
  }

  async register() {
    if (!this.form.value.did) return;
    await this.ethereumService.register(this.form.value.did);
    this.form.reset();
  }

}
