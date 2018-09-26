import { NgxDatagridPage } from './app.po';

describe('ngx-datagrid App', () => {
  let page: NgxDatagridPage;

  beforeEach(() => {
    page = new NgxDatagridPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('ngx-datagrid works!');
  });
});
