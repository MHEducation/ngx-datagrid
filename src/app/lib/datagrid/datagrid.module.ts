import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DatagridComponent } from './datagrid.component';
import { CellComponent } from '../cell/cell.component';

@NgModule({
  declarations: [DatagridComponent, CellComponent],
  imports: [CommonModule],
  entryComponents: [CellComponent],
  exports: [DatagridComponent]
})
export class DatagridModule {}

export * from './datagrid.component';
