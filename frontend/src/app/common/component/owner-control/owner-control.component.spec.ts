import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerControlComponent } from './owner-control.component';

describe('OwnerControlComponent', () => {
  let component: OwnerControlComponent;
  let fixture: ComponentFixture<OwnerControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
