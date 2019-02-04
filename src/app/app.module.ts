import { BrowserModule } from '@angular/platform-browser';
import { enableProdMode, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DatagridModule } from '../lib/ngx-datagrid.module';

enableProdMode();
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DatagridModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
