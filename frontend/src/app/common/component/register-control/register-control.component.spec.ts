import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterControlComponent } from './register-control.component';

describe('RegisterControlComponent', () => {
  let component: RegisterControlComponent;
  let fixture: ComponentFixture<RegisterControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
