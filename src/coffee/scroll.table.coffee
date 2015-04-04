angular.module('goGridScroll',[]).directive('scrollTable',['$timeout',($timeout)->
  restrict: 'A'

  link: (scope, element)->
    header_el = element.parent().find('.go-grid-table-header')

    calculatePageSize = ->
      row_height = ($(element).find('td ').height()||30) + 3
      scope.viewParams.pageSize =
        Math.round($(element).height()/row_height)

    $(window).resize ->
      if $.contains document.documentElement, element[0]
        calculatePageSize()
        resize()
        scope.$apply()


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

    scope.$watch 'source.data', (n)->
      if n
        [active] = scope.source.data.filter (i)->
          i.active
        index = scope.source.data.indexOf active
        if index >= 0
          setTimeout ->
            row_height = ($(element).find('td ').height() || 30) + 1
            if scope.viewParams.pageSize - 1 < index
              element.scrollTop (index + 2 - scope.viewParams.pageSize)*row_height + 5
          , 200

    scope.$watch 'columns', ->
      $timeout ->
        resize()
      , 200
    , true
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
              if scope.viewParams.page > scope.source.data.length/scope.viewParams.pageSize
                scope.viewParams.page = Math.round(scope.source.data.length/scope.viewParams.pageSize)
              scope.infinite()

])
