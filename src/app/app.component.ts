import { Subject } from 'rxjs/Subject';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  selector: 'ngx-datagrid-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('tableCell', { read: TemplateRef })
  tableCellTemplate: TemplateRef<any>;
  @ViewChild('columnHeader', { read: TemplateRef })
  columnHeaderTemplate: TemplateRef<any>;
  @ViewChild('ngxDataGrid')
  ngxDataGrid;

  title = 'ngx-datagrid works!';
  data = new DataSource();
  list: any;

  columnPage = 1;
  rowPage = 1;
  config = {
    columnPageSize: 100,
    columnWidth: 200,
    rowHeight: 40,
    rowPageSize: 100
  };

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

  removeEventListener() {
    this.ngxDataGrid.removeTouchHandlers();
  }
}
