import { TestBed } from '@angular/core/testing';

import { SWABackendService } from './backend.service';
import { HttpClientModule } from '@angular/common/http';

describe('SWABackendService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it('should be created', () => {
    const service: SWABackendService = TestBed.get(SWABackendService);
    expect(service).toBeTruthy();
  });
});
