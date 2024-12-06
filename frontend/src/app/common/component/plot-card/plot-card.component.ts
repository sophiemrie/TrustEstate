import { Component, input, OnDestroy } from '@angular/core';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { Plot } from '../../type/plot.type';
import { MatIconModule } from '@angular/material/icon';
import { Ownership } from '../../type/ownership.type';
import { PlotOwnersTableComponent } from '../plot-owners-table/plot-owners-table.component';
import { MatButtonModule } from '@angular/material/button';
import { CreateTransferProposalModalComponent } from '../create-transfer-proposal-modal/create-transfer-proposal-modal.component';
import { EthereumService } from '../../service/ethereum.service';
import { from, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateSplitProposalModalComponent } from '../create-split-proposal-modal/create-split-proposal-modal.component';
import { CreateMergeProposalModalComponent } from '../create-merge-proposal-modal/create-merge-proposal-modal.component';

@Component({
  selector: 'app-plot-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    PlotOwnersTableComponent,
    MatButtonModule,
    MatCardActions,
  ],
  templateUrl: './plot-card.component.html',
  styleUrl: './plot-card.component.scss'
})
export class PlotCardComponent implements OnDestroy {
  plot = input.required<Plot>();
  owners = input.required<Ownership[]>();

  subscriptions: Subscription[] = [];

  constructor(
    private ethereumService: EthereumService,
    private dialog: MatDialog
  ) {}

  createTransferProposal() {
    const dialogRef = this.dialog.open(CreateTransferProposalModalComponent);

    const dialogRefSubscription = dialogRef.afterClosed().subscribe(formResult => {
      if(!formResult) return;

      const createTransferProposalSubscription = from(this.ethereumService.createTransferProposal(this.plot().id, formResult)).subscribe();
      this.subscriptions.push(createTransferProposalSubscription);
    });

    this.subscriptions.push(dialogRefSubscription);
  }

  createSplitProposal() {
    const dialogRef = this.dialog.open(CreateSplitProposalModalComponent, {
      // minWidth: '540px',
      maxWidth: '95vw',
    });

    const dialogRefSubscription = dialogRef.afterClosed().subscribe(formResult => {
      if(!formResult) return;

      const createSplitProposalSubscription = from(this.ethereumService.createSplitProposal(this.plot().id, formResult.ipfsHash1, formResult.ipfsHash2, formResult.owners1, formResult.owners2)).subscribe();
      this.subscriptions.push(createSplitProposalSubscription);
    });

    this.subscriptions.push(dialogRefSubscription);
  }

  createMergeProposal() {
    const dialogRef = this.dialog.open(CreateMergeProposalModalComponent);

    const dialogRefSubscription = dialogRef.afterClosed().subscribe(formResult => {
      if(!formResult) return;

      const createMergeProposalSubscription = from(this.ethereumService.createMergeProposal(this.plot().id, formResult.plotId, formResult.plotData, formResult.owners)).subscribe();
      this.subscriptions.push(createMergeProposalSubscription);
    });

    this.subscriptions.push(dialogRefSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
