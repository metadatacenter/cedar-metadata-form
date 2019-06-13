import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeValueComponent } from './attribute-value.component';

describe('AttributeValueComponent', () => {
  let component: AttributeValueComponent;
  let fixture: ComponentFixture<AttributeValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
