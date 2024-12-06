import { Component } from '@angular/core';
import { ProposalTableComponent } from '../../common/component/proposal-table/proposal-table.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFabAnchor, MatFabButton } from '@angular/material/button';

@Component({
  selector: 'app-proposal',
  standalone: true,
  imports: [
    ProposalTableComponent,
    MatIconModule,
  ],
  templateUrl: './proposal.component.html',
  styleUrl: './proposal.component.scss'
})
export class ProposalComponent {

}
