import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintPlotComponent } from './mint-plot.component';

describe('MintPlotComponent', () => {
  let component: MintPlotComponent;
  let fixture: ComponentFixture<MintPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MintPlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MintPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
