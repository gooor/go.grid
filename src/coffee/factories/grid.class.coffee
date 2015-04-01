angular.module('goGridClass',['goGridXLSExporter']).factory('gridClass', ['XLSExport',(XLSExport)->
  class Grid
    buildColumns: (storage)->
      columns = storage.get(@scope.name + '.columns') || {}
      new_columns = []

      for name, column of columns
        new_columns[column.index] = null

      for column in @scope.columnsDef
        column_data = columns[column.name]
        if column_data and column_data.index?
          new_columns[column_data.index] = $.extend {}, column
          new_columns[column_data.index].visible = column_data.visible
          new_columns[column_data.index].width = column_data.width if column_data.width
        else
          new_columns.push column

      new_columns = new_columns.filter (i)->
        i


      @scope.columnGroups = []
      @scope.columnsGroupped = []
      @scope.columns = new_columns

    groupColumns: ->
      columnGroups = []
      columnsGroupped = []

      dd = @scope.columns.filter((i)->
        i.visible
      )
      for column,i in dd
        if column.group
          columnsGroupped.push column
          if not dd[i-1] or column.group isnt dd[i-1].group
            columnGroups.push
              header: column.group
              span: 1
              type: 'group'
          else if dd[i-1] and column.group is dd[i-1].group
            columnGroups[columnGroups.length - 1].span++
        else
          columnGroups.push column

      @scope.columnGroups.splice 0, @scope.columnGroups.length
      @scope.columnsGroupped.splice 0, @scope.columnsGroupped.length
      @scope.columnGroups.push columnGroups...
      @scope.columnsGroupped.push columnsGroupped...

    watchColumns: (storage)->
      d = {}
      for column, i in @scope.columns
        d[column.name] =
          visible: column.visible
          width: column.width
          index: i
      storage.set(@scope.name + '.columns', d)
      @groupColumns()

    watchSource: ($parse)->
      if @attrs.source
        prsed = $parse(@attrs.source)(@scope)
        if prsed
          if prsed.$resolved
            @scope.source.data = prsed
          else
            @scope.source.data = []
            if prsed.$promise
              prsed.$promise.then =>
                @scope.source.data = $parse(@attrs.source)(@scope)
        else
          @scope.source.data = []

    infiniteScroll: ($timeout)->
      @scope.$watch 'viewParams.pageSize', (o,v)=>
        if o isnt v
          @scope.infinite()

      @scope.$watch 'viewParams.length', =>
        $timeout =>
          @scope.viewParams.page = 1
          row_height = ($(@element).find('.go-grid-table-body td').height() || 29) #- 1
          $(@element).find('.go-grid-table-body > div').height @scope.viewParams.length*row_height

          $(@element).find('.go-grid-table-body').scrollTop 0
        , 10

      @scope.$watch 'viewParams.page', =>
        if parseInt(@scope.viewParams.page) > 2
          row_height = ($(@element).find('.go-grid-table-body table td ').height() || 29) + 1
          margin = (row_height)*@scope.viewParams.pageSize*(parseInt(@scope.viewParams.page)-2)
          $(@element).find('.go-grid-table-body > div').css
            paddingTop: margin
        else
          $(@element).find('.go-grid-table-body > div').css
            paddingTop: 0


    cellStyleSetters: ->

      @scope.cellStyle = (item, column)->
        color: if item.active or item.selected then  item['_' + column.name + 'color_'] else (item['_' + column.name + 'color_'] || item._color_)
        backgroundColor: (if item.active or item.selected then item['_' + column.name + 'bgcolor_'] else (item['_' + column.name + 'bgcolor_'] || item._bgcolor_))
        borderColor: (if item.active or item.selected then item['_' + column.name + 'bgcolor_'] else (item['_' + column.name + 'bgcolor_'] || item._bgcolor_))

      @scope.emptyCellStyle = (item)->
        backgroundColor: (if item.active or item.selected then null else item._bgcolor)
        borderColor: (if item.active or item.selected then null else item._bgcolor_)


      @scope.rowClass = (item)=>
        active: item.active
        selected: item.selected
        highlighted: (item is @scope.highlighted)


      @scope.columnWidth = (column)->
        width: column.width

    constructor: (scope, element, attrs, ctrl, transclude, $timeout)->
      @scope = scope
      @element = element
      @attrs = attrs
      @ctrl = ctrl
      @transclude = transclude
      @scope.hideHeader = attrs.hideHeader

      @xls_export = new XLSExport(attrs.name, scope.columns, scope.data)

      @scope.exportCSV = =>
        @xls_export.data = @scope.source.data
        @xls_export.columns = @scope.columns
        @xls_export.file_name = attrs.name
        @xls_export.doExport(@scope, $timeout)
])
