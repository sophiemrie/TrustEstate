import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveProposalComponent } from './approve-proposal.component';

describe('ApproveProposalComponent', () => {
  let component: ApproveProposalComponent;
  let fixture: ComponentFixture<ApproveProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveProposalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
