import { Component } from '@angular/core';
import { RegisterControlComponent } from '../../common/component/register-control/register-control.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RegisterControlComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

}
