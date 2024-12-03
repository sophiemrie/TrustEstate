import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferShareModalComponent } from './transfer-share-modal.component';

describe('TransferShareModalComponent', () => {
  let component: TransferShareModalComponent;
  let fixture: ComponentFixture<TransferShareModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferShareModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferShareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
