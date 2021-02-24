import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCondaComponent } from './form-conda.component';

describe('FormCondaComponent', () => {
  let component: FormCondaComponent;
  let fixture: ComponentFixture<FormCondaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCondaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCondaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
