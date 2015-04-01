angular.module('goGridColumns',[]).directive('columns', ['$parse','$timeout',($parse, $timeout)->
  restrict: 'E'
  link: (scope, element,attrs)->
    if attrs.source?
      for c in $parse(attrs.source)(scope)
        c.sortable = true if typeof c.sortable is 'undefined'
        c.resizable = true if typeof c.resizable is 'undefined'
        c.visible = false if typeof c.hidden is 'undefined'
        c.visible = not c.hidden? and c.hidden isnt 'false'
        c.template ||= ''

        scope.columnsDef.push c
    true
]).directive('column', [()->
  restrict: 'E'
  link: (scope, element, attrs)->
    tpl = attrs.template || element.html()
    tpl = tpl.replace(/go-(ng-repeat|ng-href)/g,'$1')
    scope.columnsDef.push
      name: attrs.name
      width: attrs.width
      header: attrs.header
      sort: attrs.sort
      sortable: attrs.sort? and attrs.sort isnt 'false'
      visible: not attrs.hidden? and attrs.hidden isnt 'false'
      resizable: attrs.resize? and attrs.resize isnt 'false'
      template: tpl
      group: attrs.group || ''
      right: attrs.right? and attrs.right isnt 'false'
    if attrs.sortDefault?
      scope.viewParams.sort_by = [
        column: attrs.sort || attrs.name
        direction: 1
      ]
      scope.viewParams.sort_columns = {}
      scope.viewParams.sort_columns[attrs.sort || attrs.name] = 1

]).directive('checkboxColumn', [()->
  restrict: 'E'
  link: (scope, element, attrs)->
    field = attrs.field || 'selected'
    scope.columnsDef.push
      field: field
      visible: not attrs.hidden?
      width: attrs.width
      header: 'Operacje grupowe'
      type: 'checkbox'
      name: attrs.name || 'checkbox'
      template: '<input type="checkbox" class="checkbox" ng-model="item.' + field + '" />'


]).directive('columnHeader',['$compile',($compile)->
  restrict: 'A'
  templateUrl: 'grid_column.html'
  link: (scope, element, attrs)->



    if scope.column.right
      element.addClass 'text-right'

    if scope.column.type is 'checkbox'
      element.html '<div style="width: ' + scope.column.width + 'px; padding: 0 0 0 6px"><input type="checkbox" class="checkbox" /></div>'
      element.find('input').on 'click', ->
        for item in scope.filtered
          item[scope.column.field] = false
        if $(@).prop('checked')
          for item in scope.filtered
            item[scope.column.field] = true
        scope.$apply()

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
          scope.$apply ->
            existing = scope.viewParams.sort_by.filter (i)->
              i.column is sort_by
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


]).directive('columnConfig',[()->
  restrict: 'E'

  replace: true
  template: ['<div class="column-config">'
             '<a class="checkbox-link" href="javascript:void(0)" ng-click="column.visible = !column.visible">'
             ' <span class="fa fw" ng-class="{\'fa-check-square-o\': column.visible, \'fa-square-o\': !column.visible}" ng-click="column.visible = !column.visible">'
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
        [el] = scope.columns.splice(index, 1)
        scope.columns.splice(index-1, 0, el)
        # scope.columns.moveUp(index)

    scope.moveColumnDown = ->
      index = scope.columns.indexOf(scope.column)
      if index >= 0
        [el] = scope.columns.splice(index, 1)
        scope.columns.splice(index+1, 0, el)
        # scope.columns.moveDown(index)

    $(element).find('a').on 'click', (e)->
      e.preventDefault()
      false

    $(element).find('span.fa').on 'click', (e)->
      e.preventDefault()
      false


])
