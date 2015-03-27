###2014-10-23
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


angular.module('goGrid', ['goGridControllers', 'goGridFilters','goGridClass','goGridTemplates','goGridScroll','goGridColumns']).directive('goGrid', ['$compile', '$parse', '$timeout','storage', '$interpolate','gridClass', ($compile, $parse, $timeout,storage, $interpolate,gridClass)->
  restrict: 'A'
  scope: true
  controller: 'GoGridController'

  link: (scope, element, attrs, ctrl, transclude)->

    # scope.read_only = attrs.readOnly
    scope.name = $parse(attrs.name)(scope)

    obj = new gridClass(scope, element, attrs, ctrl, transclude, $timeout)

    obj.buildColumns(storage)
    obj.groupColumns()

    scope.$watch 'columns', ->
      obj.watchColumns(storage)
    , true

    if attrs.onSelect
      scope.onSelect = scope[attrs.onSelect.replace('()','')]
    unless scope.onSelect
      scope.onSelect = (item)->
        for i in scope.source.data
          delete i.active
        item.active = true

    scope.source =
      data: $parse(attrs.source)(scope)

    scope.filtered = scope.source.data

    scope.viewParams.infinite = attrs.infinite?

    scope.sort()

    scope.resetStorage = ->
      storage.set scope.name + '.columns', null
      true

    scope.$watch attrs.source, ->
      obj.watchSource($parse)

    obj.cellStyleSetters()


    # For perfomance reason there's no deep watcher
    # To trigger refresh goGrid is listening for $trigger
    # You must trigger manually change $trigger ($trigger = !$trigger or $trigger++, anything that makes $watcher to act) on every change in record
    scope.$watch 'source.data.$trigger', ->
      scope.filter()

    # watch for $resolve - if data is $http promise it clears data at start of loading and fills data after success
    scope.$watch 'source.data.$resolved', ->
      scope.viewParams.length = scope.source.data.length
      scope.filter()

    if scope.viewParams.infinite
      obj.infiniteScroll($timeout)
    else
      scope.truncated = scope.filtered

    element.html('<div ng-include="\'grid_base.html\'"></div>')
    $compile(element.contents())(scope)

])






.directive('goCell', ['$compile',($compile)->
  restrict: 'A'
#  compile: (element)->
  link: (scope, element)->
    tpl = scope.column.template
    if tpl is ''
      pref = ''
      pref = '::' if scope.read_only
      tpl = '{{ ' + (pref) + 'item.' + scope.column.name + ' }}'

    classes = []
    if scope.column.right
      classes.push 'text-right'

    ntpl = '<div'
    ntpl += ' ng-click="highlight(item)"' unless scope.column.type is 'checkbox'
    ntpl += ' ng-style="columnWidth(column)"' #if scope.row_index is 0
    ntpl += " class=\"#{classes.join(' ')}\">#{tpl}</div>"

    element.html(ntpl)

    $compile(element.contents())(scope)

#      element.on 'click', (e)=>
#        scope.editing = true
#        if scope.column.type is 'checkbox'
#          e.stopPropagation()

])







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
