import { browser, element, by } from 'protractor';

export class NgxDatagridPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ngx-datagrid-root h1')).getText();
  }
}
