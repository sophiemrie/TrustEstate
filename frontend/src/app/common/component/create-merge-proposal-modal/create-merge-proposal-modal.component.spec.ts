import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMergeProposalModalComponent } from './create-merge-proposal-modal.component';

describe('CreateMergeProposalModalComponent', () => {
  let component: CreateMergeProposalModalComponent;
  let fixture: ComponentFixture<CreateMergeProposalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMergeProposalModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMergeProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
