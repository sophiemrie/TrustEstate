import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTransferProposalModalComponent } from './create-transfer-proposal-modal.component';

describe('CreateTransferProposalModalComponent', () => {
  let component: CreateTransferProposalModalComponent;
  let fixture: ComponentFixture<CreateTransferProposalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTransferProposalModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTransferProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
