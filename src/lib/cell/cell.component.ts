import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';

import { BehaviorSubject ,  Subject } from 'rxjs';

@Component({
  selector: 'ngx-datagrid-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements AfterViewInit, OnInit {
  @HostBinding('style.width.px')
  @Input()
  columnWidth;
  @HostBinding('style.height.px')
  @Input()
  rowHeight;
  @HostBinding('style.lineHeight.px')
  lineHeight;

  @Input()
  cellTemplate: TemplateRef<any>;
  @Input()
  data$: BehaviorSubject<any>;
  @Input()
  x: number;
  @Input()
  y: number;
  isPinnedHeader = false;
  isPinnedColumn = false;

  cellViewInit: Subject<any> = new Subject();

  context: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (!this.isPinnedHeader) {
      this.lineHeight = this.rowHeight;
    }

    if (this.isPinnedHeader && this.isPinnedColumn) {
      this.el.nativeElement.classList.add('pinned-origin');
    } else if (this.isPinnedHeader) {
      this.el.nativeElement.classList.add('pinned-row');
    } else if (this.isPinnedColumn) {
      this.el.nativeElement.classList.add('pinned-column');
    }
  }

  ngAfterViewInit() {
    this.cellViewInit.next(this.el.nativeElement.getBoundingClientRect());
  }

  setContext() {
    this.context = {
      data$: this.data$,
      x: this.x,
      y: this.y
    };
  }
}
