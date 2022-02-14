import { InjectFlags } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ComponentConductorService } from './component-conductor.service';

describe('ComponentConductorService', () => {
  let service: ComponentConductorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentConductorService, new ComponentConductorService(), InjectFlags.Optional);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
