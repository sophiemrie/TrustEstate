import { Component, computed, effect, input, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Ownership } from '../../type/ownership.type';
import { EthereumService } from '../../service/ethereum.service';
import { MatButtonModule } from '@angular/material/button';
import { TransferShareModalComponent } from '../transfer-share-modal/transfer-share-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { from, Subscription } from 'rxjs';

@Component({
  selector: 'app-plot-owners-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './plot-owners-table.component.html',
  styleUrl: './plot-owners-table.component.scss'
})
export class PlotOwnersTableComponent implements OnDestroy {

  owners = input.required<Ownership[]>();
  plotId = input.required<number>();
  allowIndividualTransfer = input.required<boolean>();
  ownersIsMe = computed(() => this.owners().map(owner => {
    owner.isMe = owner.owner.toLowerCase() == this.ethereumService.getAccounts()[0].toLowerCase();
    return owner;
  }));
  dataSource = computed(() => {
    const owners = this.ownersIsMe();
    const table = new MatTableDataSource(owners);
    return table;
  });
  totalShares = computed(() => this.owners().reduce((acc, curr) => acc + BigInt(curr.share), BigInt(0)));
  displayedColumns = ['owner', 'share'];

  private subscriptions: Subscription[] = [];

  constructor(
    private ethereumService: EthereumService,
    private dialog: MatDialog,
  ) {
    effect(() => {
      const isOwner = this.ownersIsMe().map(owners => owners.isMe).includes(true)
      this.displayedColumns = isOwner && this.allowIndividualTransfer() ? ['owner', 'share', 'action'] : ['owner', 'share'];
    });

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  transferOwnership(ownership: Ownership) {
    const dialogRef = this.dialog.open(TransferShareModalComponent, { data: {
      amount: ownership.share,
      to: ''
    } });

    const dialogRefSubscription = dialogRef.afterClosed().subscribe(formResult => {
      const transferSubscription = from(this.ethereumService.transferOwnershipShare(this.plotId(), formResult.amount, formResult.to)).subscribe();
      this.subscriptions.push(transferSubscription);
    });

    this.subscriptions.push(dialogRefSubscription);
  }

}
