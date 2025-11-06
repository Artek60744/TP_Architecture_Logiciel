import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotButtonComponent } from './screenshot-button.component';

describe('ScreenshotButtonComponent', () => {
  let component: ScreenshotButtonComponent;
  let fixture: ComponentFixture<ScreenshotButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenshotButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
