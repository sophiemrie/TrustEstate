import { Component } from '@angular/core';
import { MatFabButton, MatFabAnchor } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProposalTableComponent } from '../../common/component/proposal-table/proposal-table.component';


@Component({
    selector: 'app-proposal',
    standalone: true,
    imports: [
        ProposalTableComponent,
        MatIconModule,
        MatFabButton,
        MatFabAnchor,
    ],
    templateUrl: './proposal.component.html',
    styleUrl: './proposal.component.scss'
})
export class ProposalComponent {
}

