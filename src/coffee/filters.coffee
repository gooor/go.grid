angular.module('goGridFilters',[])
.directive('filters', ['$compile',($compile)->
  restrict: 'E'
  link: (scope, element, attrs)->
    scope.filters = []
    scope.viewParams.filtersTpl = element.html()
]).directive('multiFilter', ['$compile','storage','$timeout', ($compile,storage,$timeout)->
  restrict: 'E'
  link: (scope, element, attrs)->
    tpl = '<select multiselect multiple="multiple" ng-model="viewParams.filters.' + (attrs.field || attrs.name) + '.value" ng-options="item.id as item.label for item in ' + attrs.items + '"></select>'
    unless (scope.viewParams.filters ||= {})[attrs.name]
      (scope.viewParams.filters ||= {})[attrs.name] =
        type: 'list'
        field: attrs.name
        value: []
      $timeout ->
        (scope.viewParams.filters ||= {})[attrs.name].value = storage.get(scope.name + '_filter_' + attrs.name)
        scope.$watch 'viewParams.filters.' + attrs.name + '.value', (o,v)->
          scope.filter()
          storage.set(scope.name + '_filter_' + attrs.name,o)
      , 30

      element.html(tpl)
#      $compile(element.contents())(scope)
]).directive('searchFilter', ['$compile','storage','$timeout',($compile,storage,$timeout)->
  restrict: 'E'
  link: (scope, element, attrs)->
    tpl = '<input class="form-control" ng-model="viewParams.filters.' + attrs.name + '.value" />'
    unless (scope.viewParams.filters ||= {})[attrs.name]
      (scope.viewParams.filters ||= {})[attrs.name] =
        type: 'text'
        fields: attrs.fields.split(',')
        name: attrs.name
        value: ''
      element.html(tpl)
      $timeout ->
        (scope.viewParams.filters ||= {})[attrs.name].value = storage.get(scope.name + '_filter_' + attrs.name) || ''
        t = scope.viewParams.filters[attrs.name].value.replace('%', '(.)+')
        t = '(?=.*' + t.split('&').join(')(?=.*') + ')'
        try
          scope.viewParams.filters[attrs.name].exp = new RegExp("(#{t})", 'i')
        catch e
          true
        scope.filter()
        scope.$watch 'viewParams.filters.' + attrs.name + '.value', (o,v)->
          if o isnt v
            storage.set(scope.name + '_filter_' + attrs.name,o)
            t = scope.viewParams.filters[attrs.name].value.replace('%', '(.)+')
            t = '(?=.*' + t.split('&').join(')(?=.*') + ')'
            try
              scope.viewParams.filters[attrs.name].exp = new RegExp("(#{t})", 'i')
            catch e
              true
            scope.filter()

      , 100


]).directive('checkFilter', ['$compile',($compile)->
  restrict: 'E'
  link: (scope, element, attrs)->
    tpl = '<button class="btn btn-default" ng-click="viewParams.filters.' + attrs.name + '.value = !viewParams.filters.' + attrs.name + '.value"><span class="fa" ng-class="{\'fa-square-o\': !viewParams.filters.' + attrs.name + '.value,\'fa-check-square-o\': viewParams.filters.' + attrs.name + '.value}"></span> ' + attrs.label + '</button>'
    unless (scope.viewParams.filters ||= {})[attrs.name]
      scope.$watch 'viewParams.filters.' + attrs.name + '.value', (o,v)->
        if o isnt v
          scope.filter()

      (scope.viewParams.filters ||= {})[attrs.name] =
        type: 'check'
        field: attrs.field
        name: attrs.name
        value: attrs.initial || false
        selected: attrs.value

      element.html(tpl)

]).directive('filtersContainer', ['$compile',($compile)->
  restrict: 'A'

  compile: (element)->
    (scope, element, attrs)->
      element.html('<div ng-include="\'filters_container.html\'"></div>')
      element.append scope.viewParams.filtersTpl

      $compile(element.contents())(scope)

])
