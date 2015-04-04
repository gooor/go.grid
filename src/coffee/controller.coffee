angular.module('goGridControllers',['goGridDiacritics']).controller('GoGridController', ['$scope','storage','removeDiacritics',($scope,storage,removeDiacritics)->
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

  $scope.saved_filter_values = storage.get($scope.name + '.filter_values') || {}



  $scope.highlight = (item)->
    $scope.highlighted = item
    if $scope.onSelect
      $scope.onSelect(item)

  $scope.filter = ->
    filters = $scope.viewParams.filters
    list = $scope.source.data || []
    if filters
      for name, filter of filters
        if filter.type is 'text' and filter.exp
          list = list.filter (item)->
            test_string = []
            for field in filter.fields
              test_string.push item[field]
            i = filter.exp.test test_string.join(' ')
            if not i
              item.__go_grid_hidden = true
            else
              item.__go_grid_hidden = false
            i
        if filter.type is 'check' and not filter.value
          list = list.filter (item)->
            i = item[filter.field].toString() is filter.selected
            if i
              item.__go_grid_hidden = false
            else
              item.__go_grid_hidden = true
            i
        if filter.type is 'list' and (filter.value || []).length > 0
          list = list.filter (item)->
            i = filter.value.indexOf(item[filter.field]) >= 0
            if not i
              item.__go_grid_hidden = true
            else
              item.__go_grid_hidden = false
            i

      if list.length < $scope.viewParams.length
        $scope.viewParams.page = 1
      $scope.viewParams.length = list.length

    $scope.filtered = list

    $scope.sort()
    $scope.infinite() if $scope.viewParams.infinite

  $scope.sort = ->
    list = $scope.filtered
    if $scope.viewParams.sort_by.length and list.length > 1
      # console.log $scope.viewParams.sort_by[0].direction
      sortBy = $scope.viewParams.sort_by[0].column
      field = list[0][sortBy]
      if $.isNumeric(field)
        toStringFn = ->
          ('000000000000000000000000000000' + @[sortBy].toFixed(20)).substr(-51)
      else
        toStringFn = ->
          removeDiacritics(@[sortBy]||'').toLowerCase() #.removeDiacritics()

      item.toString = toStringFn for item in list
      list = list.sort()
      delete item.toString for item in list

      if $scope.viewParams.sort_by[0].direction < 0
        $scope.filtered = list.reverse()
      else
        $scope.filtered = list



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


])
