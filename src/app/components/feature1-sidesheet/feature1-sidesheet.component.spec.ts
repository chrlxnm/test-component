import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feature1SidesheetComponent } from './feature1-sidesheet.component';

describe('Feature1SidesheetComponent', () => {
  let component: Feature1SidesheetComponent;
  let fixture: ComponentFixture<Feature1SidesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feature1SidesheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Feature1SidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
