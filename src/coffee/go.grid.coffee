###
  <div go-grid data-source="source_array">
    <checkbox-column width="column width" field="field to set true/false on click"></checkbox-column>
    ...
    <column width="column_width" name="item filed name" header="header display">
      [html code for template] use {{ item.anything }}
  if empty <div>{{ item[attr.name] will be used</div>
  </column>
    ...
  </div>
###

angular.module('go.grid.filters',[])
angular.module('go.grid.controllers',[])
angular.module('go.grid', ['go.grid.controllers', 'go.grid.filters','angularLocalStorage'])
angular.module('go.grid').locales =
  en:
    reset_settings: 'Reset settings'
    columns: 'Columns'
    checkbox_column: 'Checkbox'
  pl:
    reset_settings: 'Reset ustawień'
    columns: 'Kolumny'
    checkbox_column: 'Operacje grupowe'

angular.module('go.grid').t = (code)->
  table = angular.module('go.grid').locales[angular.module('go.grid').locale || 'en']
  if table and table[code]
    table[code]
  else
    code
angular.module('go.grid.filters').filter 'translate', ->
  (text)->
    angular.module('go.grid').t(text)


angular.module('go.grid.controllers').controller 'goGridController', ['$scope',($scope)->
  $scope.columnsDef = []
  $scope.columns = []


  $scope.viewParams =
    sort_by: []
    page: 1
    pageSize: 1
    length: 0
    filtersVisible: true
    filters: {}
    sort_columns: {}

  measure = 0
  $scope.startMeasure = ->
    console.log 'start test'
    measure = (new Date()).getTime()

  $scope.endMeasure = ->
    console.log (new Date()).getTime() - measure

  $scope.highlight = (item)->
    $scope.highlighted = item
    if $scope.onSelect
      $scope.onSelect(item)


  $scope.filter = ->
    filters = $scope.viewParams.filters
    list = $scope.source
    if filters
      for name, filter of filters
        if filter.type = 'text' and filter.exp
          list = list.filter (item)->
            test_string = []
            for field in filter.fields
              test_string.push item[field]
            filter.exp.test test_string.join(' ')
      if list.length < $scope.viewParams.length
        $scope.viewParams.page = 1
      $scope.viewParams.length = list.length

    $scope.filtered = list

    $scope.sort()
    $scope.infinite() if $scope.viewParams.infinite

  compareFn = (item, sortBy)->
    if sortBy and item[sortBy]
      if $.isNumeric(item[sortBy])
        ('0000000000000000000000000' + item[sortBy]).slice(-24)
      else
        item[sortBy].toLowerCase() #.removeAccents(1)
    else
      ''

  $scope.sort = ->
    list = $scope.filtered
    if $scope.viewParams.sort_by.length
      sortBy = $scope.viewParams.sort_by[0].column
      list = list.sort((a,b)->
        ac = compareFn(a, sortBy)
        bc = compareFn(b, sortBy)
        if ac > bc
          1
        else if ac < bc
          -1
        else
          0
      )
      if $scope.viewParams.sort_by[0].direction < 0
        $scope.filtered = list.reverse()
      else
        $scope.filtered = list
    true


  $scope.infinite = ->
    list = $scope.filtered
    if $scope.viewParams.infinite
      start = 0
      if parseInt($scope.viewParams.page) > 2
        start = (parseInt($scope.viewParams.page) - 2)*$scope.viewParams.pageSize
      if start < 0
        start = 0
      end = (parseInt($scope.viewParams.page) + 1)*$scope.viewParams.pageSize

      list = list.slice(start, end)
    $scope.truncated = list #.slice(0, 10)


]



angular.module('go.grid').directive('goGrid', ['$compile', '$parse', '$timeout','storage', '$interpolate', ($compile, $parse, $timeout,storage, $interpolate)->
  restrict: 'A'
  scope: true

  controller: 'goGridController'

  compile: (element, attrs)->

    columns = storage.get(attrs.name + '.columns') || {}

    (scope, element, attrs, ctrl, transclude)->
      new_columns = []

      for name, column of columns
        new_columns[column.index] = null

      for column in scope.columnsDef
        column_data = columns[column.name]
        if column_data and column_data.index?
          new_columns[column_data.index] = $.extend {}, column
          new_columns[column_data.index].visible = column_data.visible
          new_columns[column_data.index].width = column_data.width if column_data.width
        else
          new_columns.push column

      scope.columns = new_columns.filter (i)->
        i


#TODO export to PDF
#      scope.exportPDF = ->
#        doc = new jsPDF('l','pt','a4')
#        e = $('<table class="table table-striped"></table>')
#
#        thead = $('<thead></thead>')
#        columns = []
#        for column, i in scope.columns
#          if column.visible and column.type isnt 'checkbox'
#            columns.push
#              header: column.header
#              index: i
#              field: column.name
#              template: column.template
#              width: column.width
#
#        ths = '<tr class="warning">'
#        for column in columns
#          ths += "<th>#{column.header}</th>"
#        ths += '</tr>'
#        thead.append ths
#        tbody = $('<tbody></tbody>')
#
#        for item in scope.source
#          tds = '<tr class="warning">'
#          for column in columns
#            tds += "<td>#{item[column.field]}</th>"
#          tds += '</tr>'
#          tbody.append tds
#
#        e.append thead
#        e.append tbody
#        d = $('<div></div>')
#        d.append e
#        $('body').append d
#        doc.fromHTML(d[0], 40,75,
#          width: 880
#        )
#        doc.save('Test.pdf')

      scope.exportCSV = ->

        ws = {}
        columns = []
        for column, i in scope.columns
          if column.visible and column.type isnt 'checkbox'
            columns.push
              header: column.header
              index: i
              field: column.name
              template: column.template
              width: column.width

        column_index = 0
        col_ref = []
        for col in columns
          cell_ref = XLSX.utils.encode_cell(c: column_index, r: 0)
          cell =
            v: col.header
            t: 's'
          ws[cell_ref] = cell
          column_index++
          col_ref.push
            wpx: col.width

        ws['!cols'] = col_ref
        row_index = 1
        max_col = 0
        moment ||= null
        XLSX.SSF._table[50] ||= 'YYYY/MM/DD'
        for item, i in scope.source
          column_index = 0
          for col in columns
            cell_ref = XLSX.utils.encode_cell(c: column_index, r: row_index)
            cell =
              v: item[col.field]
              t: 's'

            if $.isNumeric cell.v
              cell.t = 'n'
            else if moment and moment(item[col.field]).isValid() and item[col.field]?
              cell.t = 'n'
              cell.z = XLSX.SSF._table[50]
              cell.v = (moment(item[col.field]).toDate() - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)

            if col.template and cell.t is 's'
              cell.v = $interpolate(col.template)(item: item).replace(/(<([^>]+)>)/ig,"").trim()
              cell.h = $interpolate(col.template)(item: item)

            ws[cell_ref] = cell

            if column_index > max_col
              max_col = column_index
            column_index++
          row_index++
        ws['!ref'] = XLSX.utils.encode_range(
          s:
            c: 0
            r: 0
          e:
            c: max_col
            r: row_index-1
        )

        ws_name = 'export'

        wb =
          SheetNames: [ws_name]
          Sheets: {}
        wb.Sheets[ws_name] = ws

        wbout = XLSX.write(wb,
          bookType: 'xlsx'
          bookSST: true
          type: 'binary'
        )

        s2ab = (s)->
          buf = new ArrayBuffer(s.length)
          view = new Uint8Array(buf)
          for char, i in s
            view[i] = s.charCodeAt(i) & 0xFF
          buf

        t = s2ab(wbout)
        $timeout ->
          saveAs(new Blob([t],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "20320389233test.xlsx")
        , 500
        true

      scope.$watch 'columns', ->
        d = {}
        for column, i in scope.columns
          d[column.name] =
            visible: column.visible
            width: column.width
            index: i
        storage.set(attrs.name + '.columns', d)
      , true

      scope.name = attrs.name

      scope.onSelect = scope[attrs.onSelect.replace('()','')]

      scope.source = $parse(attrs.source)(scope)

      scope.filtered = scope.source

      scope.viewParams.infinite = attrs.infinite?

      scope.sort()

      scope.resetStorage = ->
        scope.columns = scope.columnsDef
        storage.set attrs.name + '.columns', null
        true


      if scope.viewParams.infinite
        scope.$watch 'source', ->
          scope.viewParams.length = scope.source.length

        scope.$watch 'viewParams.pageSize', (o,v)->
          if o isnt v
            scope.infinite()

        scope.$watch 'viewParams.length', ->
          $timeout ->
            row_height = ($(element).find('.go-grid-table-body td').height() || 30)
            $(element).find('.go-grid-table-body > div').height scope.viewParams.length*row_height

            $(element).find('.go-grid-table-body').scrollTop 0
          , 10

        scope.$watch 'viewParams.page', ->

          if parseInt(scope.viewParams.page) > 2
            row_height = ($(element).find('.go-grid-table-body table td ').height() || 30) + 1
            margin = (row_height)*scope.viewParams.pageSize*(parseInt(scope.viewParams.page)-2)
            $(element).find('.go-grid-table-body > div').css
              paddingTop: margin
          else
            $(element).find('.go-grid-table-body > div').css
              paddingTop: 0

      else
        scope.truncated = scope.filtered
      element.html('<div ng-include="\'grid_base.html\'"></div>')
      $compile(element.contents())(scope)

])

.directive('column', [()->
  restrict: 'E'
  link: (scope, element, attrs)->
    scope.columnsDef.push
      name: attrs.name
      width: attrs.width
      header: attrs.header
      sort: attrs.sort
      sortable: attrs.sort?
      visible: not attrs.hidden?
      resizable: attrs.resize? and $().resizablee
      template: element.html()
      right: attrs.right?
    if attrs.sortDefault?
      scope.viewParams.sort_by = [
        column: attrs.sort || attrs.name
        direction: 1
      ]
      scope.viewParams.sort_columns = {}
      scope.viewParams.sort_columns[attrs.sort || attrs.name] = 1

])

.directive('filters', ['$compile',($compile)->
  restrict: 'E'

  link: (scope, element, attrs)->
    scope.filters = []
    scope.filtersTpl = element.html()
])

.directive('filtersContainer', ['$compile',($compile)->
  restrict: 'A'

  compile: (element)->
    (scope, element, attrs)->
      element.html('<div ng-include="\'filters_container.html\'"></div>')
      element.append scope.filtersTpl

      $compile(element.contents())(scope)

])

.directive('searchFilter', ['$compile',($compile)->
  restrict: 'E'

  link: (scope, element, attrs)->
    tpl = '<input class="form-control" ng-model="viewParams.filters.' + attrs.name + '.value" />'

    unless (scope.viewParams.filters ||= {})[attrs.name]
      scope.$watch 'viewParams.filters.' + attrs.name + '.value', (o,v)->
        if o isnt v
          t = scope.viewParams.filters[attrs.name].value.replace('%', '(.)+')
          t = '(?=.*' + t.split('&').join(')(?=.*') + ')'
          try
            scope.viewParams.filters[attrs.name].exp = new RegExp("(#{t})", 'i')
          catch e
            true
          scope.filter()

      (scope.viewParams.filters ||= {})[attrs.name] =
        type: 'text'
        fields: attrs.fields.split(',')
        name: attrs.name
        value: ''

      element.html(tpl)
      $compile(element.contents())(scope)

])

.directive('columnHeader',['$compile',($compile)->
  findBy = (ar, field, value)->
    [a] = ar.filter (i)->
      i[field] is value
    a || false

  restrict: 'A'
  templateUrl: 'grid_column.html'
  link: (scope, element, attrs)->



    if scope.column.right
      element.addClass 'text-right'

    if scope.column.type is 'checkbox'
      element.html '<div style="width: ' + scope.column.width + 'px; padding: 0 0 0 6px"><input type="checkbox" class="checkbox" /></div>'
      element.find('input').on 'click', ->
        if $(@).prop('checked')
          sel = true
        else
          sel = false
        scope.$apply ->
          for item in scope.source
            item[scope.column.field] = sel
        true

    else
      if scope.column.resizable
        $(element).children('div').resizable
          handles: 'e'
          stop: ->
            scope.$parent.$broadcast 'columnResize'
            scope.$apply =>
              scope.column.width = $(this).width() + 8

      if scope.column.sortable
        element.addClass 'sortable'
        sort_by = scope.column.sort || scope.column.name
        $(element).on 'click', (e)->
          scope.startMeasure()
          scope.$apply ->
            existing = findBy scope.viewParams.sort_by,'column', sort_by
            if existing
              direction = existing.direction
            else
              direction = -1

            if false #e.ctrlKey
              if existing
                existing.direction = direction*(-1)
              else
                scope.viewParams.sort_by.push
                  column: sort_by
                  direction: direction*(-1)
            else
              scope.viewParams.sort_by = []
              scope.viewParams.sort_by[0] ||= {}
              scope.viewParams.sort_by[0].column = sort_by
              scope.viewParams.sort_by[0].direction = direction*(-1)
              scope.viewParams.sort_columns = {}

            scope.viewParams.sort_columns[sort_by] = direction*(-1)
            scope.sort()
            scope.infinite()
          e.preventDefault()
          false


])


.directive('checkboxColumn', [()->
  restrict: 'E'
  link: (scope, element, attrs)->
    scope.columnsDef.push
      field: attrs.field
      visible: not attrs.hidden?
      width: attrs.width
      header: angular.module('go.grid').t('checkbox_column')
      type: 'checkbox'
      name: attrs.name || 'checkbox'
      template: '<input type="checkbox" class="checkbox" ng-model="item.' + attrs.field + '" />'


])
.directive('goCell', ['$compile',($compile)->
  restrict: 'A'
  compile: (element)->
    (scope, element)->
      tpl = scope.column.template
      if tpl is ''
        tpl = '{{item[column.name]}}'

      classes = []
      if scope.column.right
        classes.push 'text-right'
      tpl = "<div ng-style=\"{width: column.width}\" class=\"#{classes.join(' ')}\">#{tpl}</div>"

      element.html(tpl)



      $compile(element.contents())(scope)

      element.on 'click', (e)=>
        scope.editing = true
        if scope.column.type is 'checkbox'
          e.stopPropagation()

])

.directive('scrollTable',['$timeout',($timeout)->
  restrict: 'A'

  link: (scope, element)->
    header_el = element.parent().find('.go-grid-table-header')

    calculatePageSize = ->
      row_height = ($(element).find('td ').height()||30) + 1
      scope.viewParams.pageSize =
        Math.round($(element).height()/row_height)

    $(window).resize ->
      calculatePageSize()

    resize = ->
      filter_el = element.parent().find('.go-grid-filters')
      header_height = header_el.height()
      filters_height = filter_el.height() + 8
      element.css
        top: header_height + filters_height
      calculatePageSize()
    $timeout ->
      resize()
    , 10


    scope.$on 'columnResize', ->
      resize()

    lastScrollTop = element.scrollTop()
    element.on 'scroll', (e)->
      header_el.scrollLeft $(@).scrollLeft()

      if lastScrollTop isnt element.scrollTop()
        lastScrollTop = element.scrollTop()

        row_height = ($(element).find('td ').height() || 30) + 1

        if scope.viewParams.infinite
          new_page = Math.round($(@).scrollTop()/row_height/scope.viewParams.pageSize) + 1
          if new_page isnt scope.viewParams.page
            scope.$apply =>
              scope.viewParams.page = new_page
              if scope.viewParams.page < 0
                scope.viewParams.page = 0
              if scope.viewParams.page > scope.source.length/scope.viewParams.pageSize
                scope.viewParams.page = Math.round(scope.source.length/scope.viewParams.pageSize)
              scope.infinite()

])

.directive('columnConfig',[()->
  restrict: 'E'

  replace: true
  template: ['<div class="column-config">'
             '<a class="checkbox-link" href="javascript:void(0)" ng-click="column.visible = !column.visible">'
             ' <span class="fa" ng-class="{\'fa-check-square-o\': column.visible, \'fa-square-o\': !column.visible}">'
             '</span>'
             ' {{column.header }}'
             '</a>'
             "<div class=\"sort-icons\">"
             "<span class=\"fa fa-chevron-up\" ng-click=\"moveColumnUp()\"></span><span class=\"fa fa-chevron-down\" ng-click=\"moveColumnDown()\"></span>"
             '</div>'
             '</div>'].join('')

  link: (scope, element)->

    scope.moveColumnUp = ->
      index = scope.columns.indexOf(scope.column)
      if index >= 0
        scope.columns.moveUp(index)

    scope.moveColumnDown = ->
      index = scope.columns.indexOf(scope.column)
      if index >= 0
        scope.columns.moveDown(index)

    $(element).find('a').on 'click', (e)->
      e.preventDefault()
      false

    $(element).find('span.fa').on 'click', (e)->
      e.preventDefault()
      false


])

.run(['$templateCache', ($templateCache)->
  $templateCache.put('grid_column.html',
    "<div ng-style=\"{width: column.width}\">" +
    "<span class=\"header-label\">{{ column.header }}</span>" +
    "<span ng-if=\"column.sortable\" class=\"sorting-arrows fa\" ng-class=\"{'fa-unsorted': !viewParams.sort_columns[column.name], 'fa-sort-up': viewParams.sort_columns[column.name] == 1, 'fa-sort-desc': viewParams.sort_columns[column.name] == -1}\">"+
    "</span>"+
    "" +
    "</div>"
  )
  $templateCache.put('filters_container.html',
    "<div class=\"go-grid-column-list btn-group\">"+
      "<button class=\"btn btn-default\" type=\"button\" data-toggle=\"dropdown\">"+
        "<span class=\"fa fa-cogs\"></span>"+
      "</button>"+
      "<ul class=\"dropdown-menu pull-right\" role=\"menu\">"+
        "<li><a href=\"javascript:void(0)\" ng-click=\"resetStorage()\">" +
        '{{\'reset_settings\' | translate }}' +
        "</a></li>"+
        "<li class=\"dropdown-header\"><strong>" +
        '{{\'columns\' | translate }}' +
        "</strong></li>"+
        "<li ng-repeat=\"(index, column) in columns\">"+
          "<column-config>"+
          "</column-config>"+
        "</li>"+
      "</ul>"+
      '<button class="btn btn-default" ng-click="exportCSV()"><span class="fa fa-cloud-download"></span></button>'+
#      '<button class="btn btn-default" ng-click="exportPDF()"><span class="fa fa-file-pdf-o"></span></button>'+
    "</div>"

  )
  $templateCache.put('grid_base.html',
    "<div class=\"go-grid-table\">"+
    "<div class=\"go-grid-filters form-inline\" ng-if=\"viewParams.filtersVisible\" filters-container>"+
    "</div>"+
    "<div class=\"go-grid-table-header\">"+
    "<table>" +
    "<thead>" +
    "<th column-header ng-repeat=\"column in columns\" column=\"column\" ng-if=\"column.visible\"></th>" +
    "<th style=\"width: 100%; min-width: 50px\"></th>" +
    "</thead>" +
    "</table>" +
    "</div>" +
    "<div class=\"go-grid-table-body\" scroll-table>"+
    "<div>"+
    "<table>"+
    "<tbody>"+
    "<tr ng-repeat=\"item in truncated track by $index\" ng-class=\"{active: item.active, selected: item.selected, highlighted: item == highlighted}\" ng-click=\"highlight(item)\">" +
    "<td ng-repeat=\"column in columns\" go-cell ng-if=\"column.visible\"></td>" +
#    "<td style=\"width: 100%\"><div style=\"width: 60px\">{{viewParams.page}} {{viewParams.pageSize}} {{viewParams.pages}}</div></td>" +
    "<td style=\"width: 100%\"></td>" +
    "</tr>" +
    "</tbody>" +
    "</table>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "\n"
  )
])

.directive('watchCount', ->
  restrict: 'A'
  link: (scope, element, opts)->
    getScopes = (element, scopes)->
      e = angular.element(element)
      scopes[e.scope().$id] = e.scope()
      for child in e.children()
        getScopes(child, scopes)
      scopes

    watchCount = (scopes)->
      c = 0
      for id, scope of scopes
        c += scope.$$watchers.length if scope.$$watchers
      c

    $(element).click ->
      count = watchCount(getScopes('body',{}))
      $(element).html("Count: #{count}")
  )