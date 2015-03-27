angular.module('goGridTemplates',[]).run(['$templateCache', ($templateCache)->
  $templateCache.put('grid_column.html',
    "<div ng-style=\"{width: column.width}\">" +
    "<span class=\"header-label\">{{ ::column.header }}</span>" +
    "<span ng-if=\"::column.sortable\" class=\"sorting-arrows fa\" ng-class=\"{'fa-unsorted': !viewParams.sort_columns[column.name], 'fa-sort-up': viewParams.sort_columns[column.name] == 1, 'fa-sort-desc': viewParams.sort_columns[column.name] == -1}\">"+
    "</span>" +
    "</div>"
  )
  $templateCache.put('filters_container.html',
    "<div class=\"go-grid-column-list\">"+
      "<button class=\"btn btn-default\" type=\"button\" data-toggle=\"dropdown\">"+
        "<span class=\"fa fa-cogs\"></span>"+
      "</button>"+
      "<ul class=\"dropdown-menu pull-right\" role=\"menu\">"+
        "<li><a href=\"javascript:void(0)\" ng-click=\"resetStorage()\">Reset ustawień</a></li>"+
        "<li class=\"dropdown-header\"><strong>Kolumny</strong></li>"+
        "<li ng-repeat=\"(index, column) in columns\">"+
          "<column-config>"+
          "</column-config>"+
        "</li>"+
      "</ul> "+
      '<button class="btn btn-default" ng-click="exportCSV()"><span class="fa fa-cloud-download"></span></button>'+
      '&nbsp;'+
      '<button class="btn btn-default" ng-click="refresh()" ng-if="refresh "><span class="fa fa-refresh"></span></button>'+
    "</div>"

  )
  $templateCache.put('grid_base.html',
    "<div class=\"go-grid-table\">"+
    "<div class=\"go-grid-filters form-inline\" ng-if=\"::viewParams.filtersVisible\" filters-container>"+
    "</div>"+
    "<div class=\"go-grid-table-header\">"+
    "<table>" +
    "<thead>" +
    '<tr>'+
    '<th column-header column="column" ng-repeat="column in columnGroups" colspan="{{column.span}}" rowspan="{{column.type == \'group\' ? 1 : 2}}" ng-class="{group: column.type == \'group\'}"></th>'+
    "<th style=\"width: 100%; min-width: 50px\" rowspan=\"2\"></th>" +
    '</tr>'+
    "<tr>" +
    "<th column-header ng-repeat=\"column in columnsGroupped\" column=\"column\"></th>" +
    "</tr>" +
    "</thead>" +
    "</table>" +
    "</div>" +
    "<div class=\"go-grid-table-body\" scroll-table>"+
    "<div>"+
    "<table>"+
    "<tbody>"+
    "<tr ng-repeat=\"(row_index,item) in truncated track by $index\" ng-class=\"rowClass(item)\">" +
    "<td ng-repeat=\"column in columns\" go-cell ng-if=\"column.visible\" ngs-click=\"highlight(item)\""+
    " ng-style=\"cellStyle(item, column)\">"+
    "</td>" +
    "<td style=\"width: 100%\" ng-style=\"emptyCellStyle(item)\"></td>" +
    "</tr>" +
    "</tbody>" +
    "</table>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "\n"
  )
])
