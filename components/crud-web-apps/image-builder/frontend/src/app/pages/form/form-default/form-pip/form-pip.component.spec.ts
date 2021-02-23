import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FormPipComponent } from "./form-pip.component";

describe("FormPipComponent", () => {
  let component: FormPipComponent;
  let fixture: ComponentFixture<FormPipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormPipComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
