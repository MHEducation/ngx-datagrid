import { BrowserModule } from '@angular/platform-browser';
import { enableProdMode, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DatagridModule } from '../lib/ngx-datagrid.module';

enableProdMode();
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpModule, DatagridModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
