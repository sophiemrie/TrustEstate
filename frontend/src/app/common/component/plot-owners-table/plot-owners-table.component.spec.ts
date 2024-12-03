import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotOwnersTableComponent } from './plot-owners-table.component';

describe('PlotOwnersTableComponent', () => {
  let component: PlotOwnersTableComponent;
  let fixture: ComponentFixture<PlotOwnersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlotOwnersTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotOwnersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
