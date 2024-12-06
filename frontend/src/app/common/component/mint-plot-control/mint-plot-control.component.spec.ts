import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintPlotControlComponent } from './MintPlotControlComponent';

describe('MintPlotControlComponent', () => {
  let component: MintPlotControlComponent;
  let fixture: ComponentFixture<MintPlotControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MintPlotControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MintPlotControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
