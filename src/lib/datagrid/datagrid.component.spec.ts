import { CommonModule } from '@angular/common';
import {
  NgModule,
  NO_ERRORS_SCHEMA,
  Component,
  ViewChild,
  TemplateRef,
  OnInit,
  ComponentRef,
  SimpleChange
} from '@angular/core';

import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { DatagridComponent } from './datagrid.component';
import { CellComponent } from '../cell/cell.component';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/mapTo';

export class DataSource {
  subject$ = new BehaviorSubject([[]]);

  getRows() {
    return this.subject$.asObservable();
  }

  update(newThing: any) {
    this.subject$.next(newThing);
  }
}

@Component({
  selector: `ngx-datagrid-testing-component`,
  template: `<h1>{{title}}</h1>
    <div class="wrapper">
      <ngx-datagrid
        [columnPage]="columnPage"
        [config]="config"
        [dataSource]="data"
        [rowPage]="rowPage"
        [gridSize]="gridSize">
        <ng-template #columnHeader let-data$="data$" let-x="x" let-y="y">
          <span class="purple">
            {{data$ | async}} ({{x}},{{y}})
          </span>
        </ng-template>

        <ng-template #tableCell let-data$="data$" let-x="x" let-y="y">
          <span class="yellow">
            {{data$ | async}} ({{x}},{{y}})
          </span>
        </ng-template>
      </ngx-datagrid>
      <div class="vertical-pagination">
        <div style="float:left">
          vertical<br>pagination<br>page {{this.rowPage}} / 5
        </div>
        <div style="float:left;margin-left:15px">
          <button class="arrow-up" [disabled]="rowPage > 4" (click)="updateRowPagination(1)"></button>
          <br>
          <button class="arrow-down" [disabled]="rowPage < 2" (click)="updateRowPagination(-1)"></button>
        </div>
      </div>
    </div>
    <div class="horizontal-pagination">
      <p>
        horizontal<br>pagination<br>page {{this.columnPage}} / 5
      </p>
      <button class="arrow-left" [disabled]="columnPage < 2" (click)="updateColumnPagination(-1)"></button>
      <button class="arrow-right" [disabled]="columnPage > 4" (click)="updateColumnPagination(1)"></button>
    </div>
    <button type="button" (click)="swapDataSource()">Swap DataSource</button>
    <button type="button" (click)="changeGridSize()">Swap grid size</button>
    `
})
export class TestingComponent implements OnInit {
  @ViewChild('tableCell', { read: TemplateRef })
  tableCellTemplate: TemplateRef<any>;

  @ViewChild('columnHeader', { read: TemplateRef })
  columnHeaderTemplate: TemplateRef<any>;

  @ViewChild(
    DatagridComponent
  ) /* using viewChild we get access to the TestComponent which is a child of TestHostComponent */
  datagridComponent: any;

  config: any = {
    columnPageSize: 100,
    columnWidth: 200,
    rowHeight: 40,
    rowPageSize: 100
  };

  data = new DataSource();
  columnPage = 1;
  rowPage = 1;
  bigDataSource: any = [];
  smallDataSource: any = [];
  usingBigDataSource = true;

  gridSize: Subject<any> = new Subject();

  ngOnInit() {
    let counter = 0;

    for (let i = 0; i < 500; i++) {
      const row = [];

      for (let j = 0; j < 500; j++) {
        counter++;

        let cellDescriptor: any;

        if (i === 0) {
          cellDescriptor = this.getCellDescriptor(counter, this.columnHeaderTemplate);
        } else {
          cellDescriptor = this.getCellDescriptor(counter, this.tableCellTemplate);
        }

        row.push(cellDescriptor);
      }

      this.bigDataSource.push(row);
    }

    this.data.update(this.bigDataSource);

    counter = 0;

    for (let i = 0; i < 20; i++) {
      const row = [];

      for (let j = 0; j < 20; j++) {
        counter++;

        let cellDescriptor;

        if (i === 0) {
          cellDescriptor = this.getCellDescriptor(counter, this.columnHeaderTemplate);
        } else {
          cellDescriptor = this.getCellDescriptor(counter, this.tableCellTemplate);
        }

        row.push(cellDescriptor);
      }

      this.smallDataSource.push(row);
    }
  }

  getCellDescriptor(data: any, template: any) {
    return { data, template };
  }

  updateColumnPagination(delta: any) {
    if (this.columnPage + delta > 0) {
      this.columnPage += delta;
    }
  }

  updateRowPagination(delta: any) {
    if (this.rowPage + delta > 0) {
      this.rowPage += delta;
    }
  }

  swapDataSource() {
    this.usingBigDataSource = !this.usingBigDataSource;

    if (this.usingBigDataSource) {
      this.data.update(this.bigDataSource);
    } else {
      this.data.update(this.smallDataSource);
    }
  }

  changeGridSize() {
    this.gridSize.next();
  }
}

@NgModule({
  declarations: [CellComponent],
  entryComponents: [CellComponent],
  imports: [CommonModule],
  schemas: [NO_ERRORS_SCHEMA]
})
class TestModule {}

describe('DatagridComponent', () => {
  let component: DatagridComponent;
  let fixture: ComponentFixture<DatagridComponent>;

  const mockObservable = Observable.of(new Object()).mapTo([[]]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatagridComponent, TestingComponent],
      imports: [TestModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatagridComponent);
    component = fixture.componentInstance;
    component.config = {
      columnWidth: 200,
      rowHeight: 40,
      gridWidth: 750,
      columnPageSize: 100,
      rowPageSize: 100
    };

    component.dataSource = {
      getRows: () => {
        return mockObservable;
      }
    };

    component.gridSize = new Subject();

    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should subscribe to the datasource input getRows observable', fakeAsync(() => {
      spyOn(mockObservable, 'subscribe');
      component.ngAfterViewInit();
      tick();
      expect(mockObservable.subscribe).toHaveBeenCalled();
    }));
  });

  describe('getNewComponent', () => {
    let testData;
    let wrapper;
    let template;

    beforeEach(() => {
      testData = { thing: 2 };
      wrapper = { data: testData, template };
      template = 'this should be a template';
    });

    it('should set the columnWidth input the column width from the datagrid config object', () => {
      const cell = component.getNewCell(1, 2, wrapper);
      expect(cell.instance.columnWidth).toBe(component.config.columnWidth);
    });

    it('should set data$ to a behavior subject with the passed in data as the value', () => {
      const cell = component.getNewCell(1, 2, wrapper);
      expect(cell.instance.data$.value).toBe(testData);
    });

    it('should set cell transform style to default (0px)', () => {
      const cell = component.getNewCell(1, 2, wrapper);

      expect(cell.location.nativeElement.style.transform).toBe('translateX(0px) translateY(0px)');
    });

    it('cellTemplate should be set to data.template', () => {
      const cell = component.getNewCell(1, 2, wrapper);
      expect(cell.instance.cellTemplate).toBe(template);
    });
  });

  describe('getPageOffset', () => {
    it('returns an offset from column pagination (columnPage - 1) * columns per page', () => {
      component.columnPage = 1;
      expect(component.getPageOffset(true)).toBe(0);

      component.columnPage = 2;
      expect(component.getPageOffset(true)).toBe(100);

      component.columnPage = 5;
      expect(component.getPageOffset(true)).toBe(400);
    });

    it('returns an offset from row pagination (rowPage - 1) * rows per page', () => {
      component.rowPage = 1;
      expect(component.getPageOffset(false)).toBe(0);

      component.rowPage = 2;
      expect(component.getPageOffset(false)).toBe(100);

      component.rowPage = 5;
      expect(component.getPageOffset(false)).toBe(400);
    });

    it('returns 0 if row page size is not set', () => {
      component.config.rowPageSize = undefined;

      component.rowPage = 1;
      expect(component.getPageOffset(false)).toBe(0);

      component.rowPage = 2;
      expect(component.getPageOffset(false)).toBe(0);

      component.rowPage = 5;
      expect(component.getPageOffset(false)).toBe(0);
    });

    it('returns 0 if column page size is not set', () => {
      component.config.columnPageSize = undefined;

      component.columnPage = 1;
      expect(component.getPageOffset(true)).toBe(0);

      component.columnPage = 2;
      expect(component.getPageOffset(false)).toBe(0);

      component.columnPage = 5;
      expect(component.getPageOffset(false)).toBe(0);
    });
  });

  describe('getTranslateString', () => {
    it(`should return translateX(' + magnitude + 'px)' when translateX param is true`, () => {
      expect(component.getTranslateString(true, 5)).toBe('translateX(5px)');
    });

    it(`should return translateY(' + magnitude + 'px)' when translateX param is false`, () => {
      expect(component.getTranslateString(false, 5)).toBe('translateY(5px)');
    });
  });

  describe('ngOnChanges', () => {
    let testingFixture;
    let testingComponent;

    beforeEach(() => {
      testingFixture = TestBed.createComponent(TestingComponent);
      testingComponent = testingFixture.componentInstance;
      testingComponent.columnPage = 1;

      testingFixture.detectChanges();
    });

    it('is called when columnPage or rowPage inputs are changed', () => {
      spyOn(testingComponent.datagridComponent, 'ngOnChanges').and.callThrough();
      expect(testingComponent.datagridComponent.ngOnChanges).not.toHaveBeenCalled();

      testingComponent.columnPage = 3;
      testingFixture.detectChanges();
      expect(testingComponent.datagridComponent.ngOnChanges).toHaveBeenCalledTimes(1);

      testingComponent.rowPage = 4;
      testingFixture.detectChanges();
      expect(testingComponent.datagridComponent.ngOnChanges).toHaveBeenCalledTimes(2);
    });
  });

  describe('pageChanged', () => {
    const change = new SimpleChange(1, 2, false);
    const noChange = new SimpleChange(1, 2, true);
    const changes = { rowPage: change };
    const nonChanges = { rowPage: noChange };

    it('returns true if rowPage or columnPage is changing', () => {
      expect(component.pageChanged(changes)).toBe(true);
    });

    it('returns false if rowPage or columnPage is arent', () => {
      expect(component.pageChanged(nonChanges)).toBeFalsy();
    });
  });

  describe('updateRows', () => {
    it('should init cells when row data size changes', () => {
      spyOn(component, 'initCells');
      spyOn(component, 'update');
      const newRows = new Array(10);
      newRows[0] = new Array(10);
      component.updateRows(newRows);
      expect(component.initCells).toHaveBeenCalled();
      expect(component.update).toHaveBeenCalled();
    });

    it('should not init cells when row data size is unchanged', () => {
      spyOn(component, 'initCells');
      spyOn(component, 'update');
      const cellRow: [ComponentRef<CellComponent>] = [] as [ComponentRef<CellComponent>];
      component.cellMatrix.push(cellRow);
      const newRows = new Array(10);
      newRows[0] = new Array(10);
      component.rows = newRows;
      component.forceUpdate = false;
      component.updateRows(newRows);
      expect(component.initCells).not.toHaveBeenCalled();
      expect(component.update).toHaveBeenCalledWith(false);
    });
  });

  describe('resize', () => {
    it('calls updateCellData and updateRows', () => {
      spyOn(component, 'updateRows');
      component.resize();

      expect(component.updateRows).toHaveBeenCalled();
    });
  });

  describe('onScroll', () => {
    it('returns false if you are scrolling past the edge of the grid', () => {
      component.config.scrollableYPixels = 0;
      component.myElement.nativeElement.dispatchEvent(new Event('scroll'));
    });
  });

  describe('shouldRebuildCellMatrix', () => {
    beforeEach(() => {
      const cellRow: [ComponentRef<CellComponent>] = [] as [ComponentRef<CellComponent>];
      component.cellMatrix.push(cellRow);
      component.forceUpdate = false;
      component.rows = new Array(10);
      component.rows[0] = new Array(10);
      fixture.detectChanges();
    });

    it('should return true if cell matrix should be rebuilt if forceUpdate is true', () => {
      component.forceUpdate = true;
      expect(component.shouldRebuildCellMatrix()).toBe(true);
    });

    it('should return set forceUpdate to true if row length changes', () => {
      spyOn(component, 'update');
      const newRows = new Array(11);
      newRows[0] = new Array(10);
      component.updateRows(newRows);
      fixture.detectChanges();
      expect(component.update).toHaveBeenCalledWith(true);
    });

    it('should return set forceUpdate to true if column length changes', () => {
      spyOn(component, 'update');
      const newRows = new Array(10);
      newRows[0] = new Array(11);
      component.updateRows(newRows);
      fixture.detectChanges();
      expect(component.update).toHaveBeenCalledWith(true);
    });

    it('should return set forceUpdate to false if row and column lengths do not change', () => {
      spyOn(component, 'update');
      const newRows = new Array(10);
      newRows[0] = new Array(10);
      component.updateRows(newRows);
      fixture.detectChanges();
      expect(component.update).toHaveBeenCalledWith(false);
    });

    it('should return true if cell matrix should be rebuilt if cellMatrix object is empty.', () => {
      component.cellMatrix = [] as [[ComponentRef<CellComponent>]];
      expect(component.shouldRebuildCellMatrix()).toBe(true);
    });
  });

  describe('touch handlers', () => {
    beforeEach(() => {
      component.pinFirstRow = true;
      fixture.detectChanges();
    });

    it('touchStartHandler should set initial touch start position', () => {
      expect(component.touchStartX).toBe(0);
      const touchEvent = { changedTouches: [{ pageX: 20 }] };
      component.touchStartHandler(touchEvent);
      expect(component.touchStartX).toBe(20);
    });

    it('should set a body scroll left of body to whatever change in touch is on touch start handler', () => {
      expect(component.touchStartX).toBe(0);
      const touchEvent = {
        changedTouches: [{ pageX: 20 }],
        preventDefault: function() {
          return false;
        }
      };
      const bodyScrollContainer = component.myElement.nativeElement.querySelector(
        '.ngx-datagrid-body-container'
      );
      const bodyScrollContainerScroller = component.myElement.nativeElement.querySelector(
        '.ngx-datagrid-body-scroller'
      );
      bodyScrollContainer.style.height = '100px';
      bodyScrollContainer.style.width = '100px';
      bodyScrollContainerScroller.style.height = '100px';
      bodyScrollContainerScroller.style.width = '5000px';
      component.touchMoveHandler(touchEvent);
      expect(component.touchStartX).toBe(20);
      touchEvent.changedTouches[0].pageX = 40;
      component.touchMoveHandler(touchEvent);
      expect(component.touchStartX).toBe(40);
    });

    it('should unsubscribe from listener objects', () => {
      component.addTouchSwipeListener();
      component.removeTouchHandlers();
      expect(component.touchStartEventListener).toBe(undefined);
      expect(component.touchMoveEventListener).toBe(undefined);
    });
  });
});
