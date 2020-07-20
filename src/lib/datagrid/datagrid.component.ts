import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { BehaviorSubject ,  Observable ,  Subject } from 'rxjs';



import { CellComponent } from '../cell/cell.component';

@Component({
  selector: 'ngx-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent
  implements OnChanges, OnDestroy, OnInit, AfterViewInit, AfterViewChecked {
  @Input()
  dataSource: any;
  @Input()
  config: any;
  @Input()
  columnPage = 1;
  @Input()
  rowPage = 1;
  @Input()
  gridSize: Subject<any>; // this should have a $ suffix
  @Input()
  pinFirstColumn = false;
  @Input()
  pinFirstRow = false;
  @Input()
  pinnedRowHeight = 0;
  @Input()
  pinnedColumnWidth = 0;

  @ViewChild('rowContainer', { read: ViewContainerRef, static: false  })
  private viewContainer: ViewContainerRef;
  @ViewChild('pinnedOrigin', { read: ViewContainerRef, static: false  })
  private pinnedOrigin: ViewContainerRef;
  @ViewChild('pinnedHeader', { read: ViewContainerRef, static: false  })
  private pinnedHeader: ViewContainerRef;
  @ViewChild('pinnedColumn', { read: ViewContainerRef, static: false  })
  private pinnedColumn: ViewContainerRef;
  @ViewChild('rowWrapper', { read: ElementRef, static: false  })
  private rowWrapper: ElementRef;
  @ViewChild('bodyWrapper', { read: ElementRef, static: false  })
  private bodyWrapper: ElementRef;

  private cellFactory: ComponentFactory<
    CellComponent
  > = this.componentFactoryResolver.resolveComponentFactory(CellComponent);
  cellMatrix: ComponentRef<CellComponent>[][] = [];
  hasOrigin = false;
  pinnedRowScrollLeft = 0;
  pinnedColumnScrollTop = 0;
  lastScrollLeft = 0;
  lastScrollTop = 0;
  rows: any;
  forceUpdate = false;
  touchStartX = 0;
  touchStartEventListener;
  touchMoveEventListener;
  tableHeaderContentBar;
  touchStartCallbackRef;

  constructor(
    public myElement: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.hasOrigin = this.pinFirstRow && this.pinFirstColumn;
  }

  ngAfterViewInit() {
    this.addTouchSwipeListener();
    this.updateConfigWithCellData();
    // need to unsubscribe ondestroy
    this.dataSource.getRows().subscribe(data => {
      this.updateRows(data, true);
    });
    if (this.gridSize) {
      this.gridSize.subscribe(this.resize.bind(this));
    }
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  resize() {
    if (this.rows) {
      this.updateRows(this.rows, true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // need to check if page should exist
    if (this.pageChanged(changes)) {
      this.resetScroll();
      this.forceUpdate = true;
      this.update();
    }
  }

  pageChanged(changes: SimpleChanges): boolean {
    return (
      (changes.rowPage && !changes.rowPage.firstChange) ||
      (changes.columnPage && !changes.columnPage.firstChange)
    );
  }

  resetScroll() {
    this.bodyWrapper.nativeElement.scrollTop = 0;
    this.bodyWrapper.nativeElement.scrollLeft = 0;
    this.lastScrollLeft = 0;
    this.lastScrollTop = 0;
  }

  updateRows(rows: any[], keepScrollPosition?: boolean) {
    if (!this.rows || this.rows.length !== rows.length || this.rows[0].length !== rows[0].length) {
      this.forceUpdate = true;
    }

    this.rows = rows;

    if (!keepScrollPosition || this.forceUpdate) {
      this.resetScroll();
    }

    // need to consider when data is 'zero-ed' out "no data to display"?
    if (rows.length && rows[0].length) {
      this.updateConfigWithCellData();

      this.config.totalGridWidth = this.calculateGridSize(
        this.config.columnWidth,
        this.config.columnPageSize,
        this.rows[0].length,
        this.pinFirstColumn,
        this.pinnedColumnWidth
      );

      this.config.totalGridHeight = this.calculateGridSize(
        this.config.rowHeight,
        this.config.rowPageSize,
        this.rows.length,
        this.pinFirstRow,
        this.pinnedRowHeight
      );

      if (this.shouldRebuildCellMatrix()) {
        this.destroyOldMatrix(this.cellMatrix);
        this.initCells();
        this.update(true);
      } else {
        this.update(false);
      }
    }
  }

  calculateGridSize(
    magnitude: number,
    pageSize: number,
    dataSize: number,
    pinned: boolean,
    offset: number
  ) {
    let size = dataSize;
    if (pageSize && dataSize > pageSize) {
      size = pageSize;
    }

    if (pinned) {
      return magnitude * (size - 1) + offset;
    } else {
      return magnitude * size;
    }
  }

  shouldRebuildCellMatrix(): boolean {
    return this.cellMatrix.length === 0 || this.forceUpdate;
  }

  initCells() {
    // there is a bug in the forloop below when there are less rows then there is space for
    for (
      let rowIndex = 0;
      rowIndex < this.rows.length && rowIndex <= this.config.visibleRows;
      rowIndex++
    ) {
      const cellRow: ComponentRef<CellComponent>[] = [];
      this.rows[rowIndex].forEach((cell: any, columnIndex: number) => {
        if (columnIndex <= this.config.visibleColumns) {
          // probably want at least 3
          cellRow.push(this.getNewCell(columnIndex, rowIndex, cell));
        }
      });

      // length = 0 when data is empty
      if (cellRow.length) {
        this.cellMatrix.push(cellRow);
      }
      // probably need to run update here for when datasource is updated
    }
  }

  destroyOldMatrix(matrix: ComponentRef<CellComponent>[][]) {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < (matrix[i] ? matrix[i].length : 0); j++) {
        const cell = matrix[i][j];
        cell.instance.data$.unsubscribe();
        cell.destroy();
      }
    }

    this.cellMatrix = [];
  }

  updateConfigWithCellData() {
    const gridBoundingClientRect = this.myElement.nativeElement.getBoundingClientRect();

    this.config.gridWidth = gridBoundingClientRect.width;
    this.config.gridHeight = gridBoundingClientRect.height;

    this.config.visibleColumns = Math.ceil(this.config.gridWidth / this.config.columnWidth);
    this.config.totalColumns = this.config.visibleColumns + 1;
    this.config.screenWidth = this.config.totalColumns * this.config.columnWidth;
    if (this.pinFirstColumn) {
      this.config.screenWidth -= this.config.columnWidth;
    }

    this.config.visibleRows = Math.ceil(this.config.gridHeight / this.config.rowHeight);
    this.config.totalRows = this.config.visibleRows + 1;
    this.config.screenHeight = this.config.totalRows * this.config.rowHeight;
    if (this.pinFirstRow) {
      this.config.screenHeight -= this.config.rowHeight;
    }
  }

  getNewCell(x: number, y: number, data: any) {
    const newCell = this.getContainer(x, y).createComponent(this.cellFactory);
    newCell.instance.isPinnedHeader = this.pinFirstRow && y === 0;
    newCell.instance.isPinnedColumn = this.pinFirstColumn && x === 0;
    newCell.instance.columnWidth = this.getNewColumnWidth(x);
    newCell.instance.rowHeight = this.getNewHeightWidth(y);
    newCell.instance.data$ = new BehaviorSubject(data.data);
    newCell.instance.x = x;
    newCell.instance.y = y;
    newCell.location.nativeElement.style.transform = 'translateX(0px) translateY(0px)';
    newCell.instance.setContext();
    newCell.instance.cellTemplate = data.template;

    if (x === 0 || (this.pinFirstColumn && x === 1)) {
      newCell.location.nativeElement.style.clear = 'both';
    }

    return newCell;
  }

  getContainer(x, y) {
    if (this.pinFirstRow && y === 0 && this.pinFirstColumn && x === 0) {
      return this.pinnedOrigin;
    } else if (this.pinFirstColumn && x === 0) {
      return this.pinnedColumn;
    } else if (this.pinFirstRow && y === 0) {
      return this.pinnedHeader;
    } else {
      return this.viewContainer;
    }
  }

  getNewColumnWidth(x) {
    if (this.pinFirstRow && x === 0) {
      return this.pinnedColumnWidth;
    } else {
      return this.config.columnWidth;
    }
  }

  getNewHeightWidth(y) {
    if (this.pinFirstColumn && y === 0) {
      return this.pinnedRowHeight;
    } else {
      return this.config.rowHeight;
    }
  }

  // If datasource size has not changed, then no need to destroy cellMatrix, just update each cell's datasource.
  updateCellDataSource(rowIndex, columnIndex, datasourceX, datasourceY) {
    if (this.rows[datasourceX] && this.rows[datasourceX][datasourceY]) {
      const cellInstance = this.cellMatrix[rowIndex][columnIndex].instance;
      const datasource = this.rows[datasourceX][datasourceY];
      cellInstance.data$.next(datasource.data);
      cellInstance.cellTemplate = datasource.template;
    }
  }

  // is it worthwhile to detach cells and reattach after editting???
  update(moveCell?) {
    moveCell = typeof moveCell === 'undefined' ? true : moveCell;

    const scrolledRowScreens = Math.floor(this.lastScrollTop / this.config.screenHeight);
    const scrolledColumnScreens = Math.floor(this.lastScrollLeft / this.config.screenWidth);
    this.pinnedRowScrollLeft = this.lastScrollLeft * -1;
    this.pinnedColumnScrollTop = this.lastScrollTop * -1;
    this.cellMatrix.forEach((cellRow, rowIndex) => {
      const adjustedScrolledRowScreens = scrolledRowScreens + this.getExtraRowShift(rowIndex);
      const rowPinned = rowIndex === 0 && this.pinFirstRow;
      let desiredTranslateY = this.getTranslateString(
        false,
        this.config.screenHeight * adjustedScrolledRowScreens
      );
      if (rowPinned) {
        desiredTranslateY = this.getTranslateString(false, 0);
      }

      const columnOffset = this.pinFirstColumn ? 1 : 0;
      const rowOffset = this.pinFirstRow ? 1 : 0;
      cellRow.forEach((cell, columnIndex) => {
        const adjustedScrolledColumnScreens =
          scrolledColumnScreens + this.getExtraColumnShift(columnIndex);
        let desiredTranslateX = this.getTranslateString(
          true,
          this.config.screenWidth * adjustedScrolledColumnScreens
        );
        const columnPinned = this.pinFirstColumn && columnIndex === 0;
        if (columnPinned) {
          desiredTranslateX = this.getTranslateString(true, 0);
        }

        // there should be caching here and not using string comparisons and dom properties
        const xChange =
          cell.location.nativeElement.style.transform.indexOf(desiredTranslateX) === -1;
        const yChange =
          cell.location.nativeElement.style.transform.indexOf(desiredTranslateY) === -1;

        let datasourceX =
          this.getPageOffset(false) +
          adjustedScrolledRowScreens * (this.config.totalRows - rowOffset) +
          rowIndex;
        let datasourceY =
          this.getPageOffset(true) +
          adjustedScrolledColumnScreens * (this.config.totalColumns - columnOffset) +
          columnIndex;

        if (rowPinned) {
          datasourceX = this.getPageOffset(false);
        }

        if (columnPinned) {
          datasourceY = this.getPageOffset(true);
        }

        if (!moveCell) {
          this.updateCellDataSource(rowIndex, columnIndex, datasourceX, datasourceY);
        } else if (
          (this.validDatasourceIndicies(datasourceX, datasourceY) && (xChange || yChange)) ||
          this.forceUpdate
        ) {
          cell.location.nativeElement.style.transform = desiredTranslateX + ' ' + desiredTranslateY;
          this.updateCellDataSource(rowIndex, columnIndex, datasourceX, datasourceY);
        }
      });
    });

    this.forceUpdate = false;
  }

  validDatasourceIndicies(y, x) {
    return y < this.maxRowInPage() && x < this.maxColumnInPage();
  }

  maxRowInPage(): number {
    return this.inScreen(this.rows.length, this.rowPage, this.config.rowPageSize);
  }

  maxColumnInPage(): number {
    return this.inScreen(this.rows[0].length, this.columnPage, this.config.columnPageSize);
  }

  inScreen(dataSize, page, pageSize): number {
    let size = dataSize;

    if (pageSize && dataSize > pageSize) {
      size = pageSize;
    }

    return size * page;
  }

  getTranslateString(translateX: boolean, magnitude): string {
    if (translateX) {
      return 'translateX(' + magnitude + 'px)';
    } else {
      return 'translateY(' + magnitude + 'px)';
    }
  }

  transformIndex(index: number, shift: number, size: number): number {
    if (shift + index < size) {
      return shift + index;
    }

    return shift + index - size;
  }

  // You need the extra 1 if you have scrolled x full screens and then past a particular row or column
  getExtraShift(scrollPosition: number, totalSize: number, size: number, index: number): number {
    return (scrollPosition % totalSize) - size * (index + 1) >= 1 ? 1 : 0;
  }

  getExtraRowShift(rowIndex: number): number {
    return this.getExtraShift(
      this.lastScrollTop,
      this.config.screenHeight,
      this.config.rowHeight,
      rowIndex - (this.pinFirstRow ? 1 : 0)
    );
  }

  getExtraColumnShift(columnIndex: number): number {
    return this.getExtraShift(
      this.lastScrollLeft,
      this.config.screenWidth,
      this.config.columnWidth,
      columnIndex - (this.pinFirstColumn ? 1 : 0)
    );
  }

  getPageOffset(column: boolean): number {
    if (column) {
      if (this.config.columnPageSize > 0) {
        return this.config.columnPageSize * (this.columnPage - 1);
      } else {
        return 0;
      }
    }

    if (this.config.rowPageSize) {
      return this.config.rowPageSize * (this.rowPage - 1);
    }

    return 0;
  }

  ngOnDestroy() {
    this.removeTouchHandlers();
    this.destroyOldMatrix(this.cellMatrix);
    if (this.gridSize) {
      this.gridSize.unsubscribe();
    }
  }

  getBodyWidth() {
    return 'calc(100% - ' + this.pinnedColumnWidth + 'px)';
  }

  getBodyHeight() {
    const containerDimensions = this.myElement.nativeElement.getBoundingClientRect();
    return containerDimensions.height - this.pinnedRowHeight + 'px';
  }

  bodyScrollHandler($event) {
    this.lastScrollLeft = $event.target.scrollLeft;
    this.lastScrollLeft = this.lastScrollLeft >= 0 ? this.lastScrollLeft : 0;
    this.lastScrollTop = $event.target.scrollTop;
    this.lastScrollTop = this.lastScrollTop >= 0 ? this.lastScrollTop : 0;
    requestAnimationFrame(this.update.bind(this));
  }

  addTouchSwipeListener() {
    if (this.pinFirstRow) {
      this.tableHeaderContentBar = this.myElement.nativeElement.querySelector(
        '.ngx-datagrid-row-header-container'
      );
      this.touchStartEventListener = this.tableHeaderContentBar.addEventListener(
        'touchstart',
        this.touchStartHandler
      );
      this.touchStartCallbackRef = this.touchMoveHandler.bind(this);
      this.touchMoveEventListener = this.tableHeaderContentBar.addEventListener(
        'touchmove',
        this.touchStartCallbackRef
      );
    }
  }

  touchStartHandler(event) {
    if (event.changedTouches) {
      this.touchStartX = event.changedTouches[0].pageX;
    }
  }

  touchMoveHandler(event) {
    if (event.changedTouches) {
      const touchObj = event.changedTouches[0];
      let offset = touchObj.pageX - this.touchStartX;
      this.touchStartX = touchObj.pageX;

      offset = offset * -1;
      this.bodyWrapper.nativeElement.scrollLeft += offset;
      event.preventDefault();
    }
  }

  removeTouchHandlers() {
    if (this.tableHeaderContentBar) {
      this.tableHeaderContentBar.removeEventListener('touchstart', this.touchStartHandler);
      this.tableHeaderContentBar.removeEventListener('touchmove', this.touchStartCallbackRef);
    }

    this.touchStartCallbackRef = undefined;
  }
}
