import { Component, computed, input, InputSignal } from '@angular/core';
import { Proposal } from '../../type/proposal.type';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { EthereumService } from '../../service/ethereum.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-proposal-detail',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
  ],
  templateUrl: './proposal-detail.component.html',
  styleUrl: './proposal-detail.component.scss'
})
export class ProposalDetailComponent {
  proposal: InputSignal<Proposal> = input.required();
  approvers = computed(() => this.proposal().hasToApprove.map(approver => ({
    approver: approver,
    hasApproved: this.proposal().approvers.includes(approver),
    isMe: approver.toLowerCase() == this.ethereumService.getAccounts()[0].toLowerCase(),
  })));
  hasApproved = computed(() => this.approvers().map(approver => approver.hasApproved && approver.isMe).includes(true));

  dataSource = computed(() => {
    return new MatTableDataSource(this.approvers());
  });

  displayedColumns = ['approver', 'hasApproved'];

  constructor(
    private ethereumService: EthereumService,
  ) { }

  approve() {
    this.ethereumService.approveProposal(this.proposal().proposalId);
  }

}
