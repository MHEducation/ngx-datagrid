import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';

import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;
  let data;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CellComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
    data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    component.data$ = Observable.of(data) as BehaviorSubject<any>;
    component.x = 5;
    component.y = 7;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('setContext', () => {
    it('should update context with values set from inputs', () => {
      expect(component.context).toBeUndefined();
      component.setContext();
      expect(component.context).toBeDefined();
      expect(Object.keys(component.context).length).toBe(3);
      expect(component.x).toBe(5);
      expect(component.y).toBe(7);
      expect(component.data$.value).toBe(data);
    });
  });
});
