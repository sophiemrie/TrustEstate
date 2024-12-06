import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSplitProposalModalComponent } from './create-split-proposal-modal.component';

describe('CreateSplitProposalModalComponent', () => {
  let component: CreateSplitProposalModalComponent;
  let fixture: ComponentFixture<CreateSplitProposalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSplitProposalModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSplitProposalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
