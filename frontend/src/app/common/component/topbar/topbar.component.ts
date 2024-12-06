import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    RouterModule,
    LogoComponent,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
}
