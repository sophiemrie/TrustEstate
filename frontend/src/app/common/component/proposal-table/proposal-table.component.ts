import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { EthereumService } from '../../service/ethereum.service';
import { Proposal, ProposalType } from '../../type/proposal.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProposalDetailComponent } from '../proposal-detail/proposal-detail.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-proposal-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    ProposalDetailComponent,
    MatCardModule,
  ],
  templateUrl: './proposal-table.component.html',
  styleUrl: './proposal-table.component.scss',
  animations: [
    trigger('expandRow', [
      state('collapsed', style({height: '0', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('expandButton', [
      state('collapsed', style({ transform: 'rotate(0)'})),
      state('expanded', style({ transform: 'rotate(180deg)'})),
      transition('expanded => collapsed', animate('225ms ease-out')),
      transition('collapsed => expanded', animate('225ms ease-in')),
    ]),
  ],
})
export class ProposalTableComponent implements OnInit {
  proposals: WritableSignal<Proposal[]> = signal([]);
  transformedProposals = computed(() => this.proposals().map(proposal => ({
    ...proposal,
    proposalTypeName: this.proposalTypeName(proposal.proposalType),
  })));
  dataSource = computed(() => new MatTableDataSource(this.transformedProposals()));
  displayedColumns = ['proposalId', 'plotId', 'proposalType', 'status', 'action'];
  expandedElement : Proposal | null = null;

  isDetailRow = (index: number, element: Proposal): boolean => {
    console.log(index, element)
    console.log(this.expandedElement === element)
    return this.expandedElement === element;
  };


  private subscriptions: Subscription[] = [];

  constructor(
    private ethereumService: EthereumService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getProposals();
  }

  async getProposals(): Promise<void> {
    const proposals = await this.ethereumService.getProposals()
    this.proposals.set(proposals);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  proposalTypeName(proposalType: BigInt): string {
    console.log(proposalType)
    switch (proposalType) {
      case BigInt(ProposalType.Split):
        return 'Split Proposal';
      case BigInt(ProposalType.Merge):
        return 'Merge Proposal';
      case BigInt(ProposalType.Transfer):
        return 'Transfer Proposal';
      default:
        return 'Unknown Proposal';
    }
  }
}
