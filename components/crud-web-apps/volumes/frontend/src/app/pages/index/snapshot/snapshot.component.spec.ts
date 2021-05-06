import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotComponent } from './snapshot.component';

describe('SnapshotDefaultComponent', () => {
  let component: SnapshotComponent;
  let fixture: ComponentFixture<SnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SnapshotComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
