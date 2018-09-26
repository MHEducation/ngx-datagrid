# NgxDatagrid

ngx-datagrid is table component that offers features not available in other Angular tables. There has only been one real viable option if you needed a performant table component in your Angular app and that has been ngx-datatable by swinlane. Angular Material has since released a datatable but is missing virtualization.

## ngx-datagrid implements features for rows & columns

Traditionally, features such as pagination and virtualization are only implemented for rows. As the number of columns increases though, your performance will decrease without horizontal virtualization. When you have a large number of columns, it makes sense to be able to page through that data just as you would a large number of rows.

## When should/shouldn't I use this versus the other available tables?

You should use ngx-datagrid if you have a large number of bindings in your grid and can reduce them by virtualizing off screen columns. To support virtualization the row height and column width must be the same for all rows and columns. The width/height of the first row/column can be customized if pinning is used. Fixed height/width was design decision to ensure that the scroll bar accurately reflect your position in the data while scrolling. You might pick another table if each row/column can have different heights/widths or you want your heights/widths to change as the grid size changes (responsive layout).

Feature list:

- row pagination
- column pagination
- initial row pinning
- initial column pinning
- row virtualization
- column virtualization
- row scrolling
- column scrolling
- configurable grid size
- grid resizing
- observable data source
- sorting and filtering, supported through observable data source
