(function() {
  angular.module('goGridDiacritics', []).factory('removeDiacritics', function() {
    var diacritics;
    diacritics = [
      {
        base: 'azzz',
        letters: /[ą]/g
      }, {
        base: 'zzzz',
        letters: /[żź]/g
      }, {
        base: 'szzz',
        letters: /[ś]/g
      }, {
        base: 'ezzz',
        letters: /[ę]/g
      }, {
        base: 'czzz',
        letters: /[ć]/g
      }, {
        base: 'nzzz',
        letters: /[ń]/g
      }, {
        base: 'ozzz',
        letters: /[ó]/g
      }, {
        base: 'lzzz',
        letters: /[ł]/g
      }
    ];
    return function(str) {
      var i;
      i = diacritics.length - 1;
      while (i >= 0) {
        str = str.replace(diacritics[i].letters, diacritics[i].base);
        i--;
      }
      return str;
    };
  });

}).call(this);

(function() {
  angular.module('goGridClass', ['goGridXLSExporter']).factory('gridClass', [
    'XLSExport', function(XLSExport) {
      var Grid;
      return Grid = (function() {
        Grid.prototype.buildColumns = function(storage) {
          var column, column_data, columns, name, new_columns, _i, _len, _ref;
          columns = storage.get(this.scope.name + '.columns') || {};
          new_columns = [];
          for (name in columns) {
            column = columns[name];
            new_columns[column.index] = null;
          }
          _ref = this.scope.columnsDef;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            column = _ref[_i];
            column_data = columns[column.name];
            if (column_data && (column_data.index != null)) {
              new_columns[column_data.index] = $.extend({}, column);
              new_columns[column_data.index].visible = column_data.visible;
              if (column_data.width) {
                new_columns[column_data.index].width = column_data.width;
              }
            } else {
              new_columns.push(column);
            }
          }
          new_columns = new_columns.filter(function(i) {
            return i;
          });
          this.scope.columnGroups = [];
          this.scope.columnsGroupped = [];
          return this.scope.columns = new_columns;
        };

        Grid.prototype.groupColumns = function() {
          var column, columnGroups, columnsGroupped, dd, i, _i, _len, _ref, _ref1;
          columnGroups = [];
          columnsGroupped = [];
          dd = this.scope.columns.filter(function(i) {
            return i.visible;
          });
          for (i = _i = 0, _len = dd.length; _i < _len; i = ++_i) {
            column = dd[i];
            if (column.group) {
              columnsGroupped.push(column);
              if (!dd[i - 1] || column.group !== dd[i - 1].group) {
                columnGroups.push({
                  header: column.group,
                  span: 1,
                  type: 'group'
                });
              } else if (dd[i - 1] && column.group === dd[i - 1].group) {
                columnGroups[columnGroups.length - 1].span++;
              }
            } else {
              columnGroups.push(column);
            }
          }
          this.scope.columnGroups.splice(0, this.scope.columnGroups.length);
          this.scope.columnsGroupped.splice(0, this.scope.columnsGroupped.length);
          (_ref = this.scope.columnGroups).push.apply(_ref, columnGroups);
          return (_ref1 = this.scope.columnsGroupped).push.apply(_ref1, columnsGroupped);
        };

        Grid.prototype.watchColumns = function(storage) {
          var column, d, i, _i, _len, _ref;
          d = {};
          _ref = this.scope.columns;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            column = _ref[i];
            d[column.name] = {
              visible: column.visible,
              width: column.width,
              index: i
            };
          }
          storage.set(this.scope.name + '.columns', d);
          return this.groupColumns();
        };

        Grid.prototype.watchSource = function($parse) {
          var prsed;
          if (this.attrs.source) {
            prsed = $parse(this.attrs.source)(this.scope);
            if (prsed) {
              if (prsed.$resolved) {
                return this.scope.source.data = prsed;
              } else {
                this.scope.source.data = [];
                if (prsed.$promise) {
                  return prsed.$promise.then((function(_this) {
                    return function() {
                      return _this.scope.source.data = $parse(_this.attrs.source)(_this.scope);
                    };
                  })(this));
                }
              }
            } else {
              return this.scope.source.data = [];
            }
          }
        };

        Grid.prototype.infiniteScroll = function($timeout) {
          this.scope.$watch('viewParams.pageSize', (function(_this) {
            return function(o, v) {
              if (o !== v) {
                return _this.scope.infinite();
              }
            };
          })(this));
          this.scope.$watch('viewParams.length', (function(_this) {
            return function() {
              return $timeout(function() {
                var row_height;
                _this.scope.viewParams.page = 1;
                row_height = $(_this.element).find('.go-grid-table-body td').height() || 29;
                $(_this.element).find('.go-grid-table-body > div').height(_this.scope.viewParams.length * row_height);
                return $(_this.element).find('.go-grid-table-body').scrollTop(0);
              }, 10);
            };
          })(this));
          return this.scope.$watch('viewParams.page', (function(_this) {
            return function() {
              var margin, row_height;
              if (parseInt(_this.scope.viewParams.page) > 2) {
                row_height = ($(_this.element).find('.go-grid-table-body table td ').height() || 29) + 1;
                margin = row_height * _this.scope.viewParams.pageSize * (parseInt(_this.scope.viewParams.page) - 2);
                return $(_this.element).find('.go-grid-table-body > div').css({
                  paddingTop: margin
                });
              } else {
                return $(_this.element).find('.go-grid-table-body > div').css({
                  paddingTop: 0
                });
              }
            };
          })(this));
        };

        Grid.prototype.cellStyleSetters = function() {
          this.scope.cellStyle = function(item, column) {
            return {
              color: item.active || item.selected ? item['_' + column.name + 'color_'] : item['_' + column.name + 'color_'] || item._color_,
              backgroundColor: (item.active || item.selected ? item['_' + column.name + 'bgcolor_'] : item['_' + column.name + 'bgcolor_'] || item._bgcolor_),
              borderColor: (item.active || item.selected ? item['_' + column.name + 'bgcolor_'] : item['_' + column.name + 'bgcolor_'] || item._bgcolor_)
            };
          };
          this.scope.emptyCellStyle = function(item) {
            return {
              backgroundColor: (item.active || item.selected ? null : item._bgcolor),
              borderColor: (item.active || item.selected ? null : item._bgcolor_)
            };
          };
          this.scope.rowClass = (function(_this) {
            return function(item) {
              return {
                active: item.active,
                selected: item.selected,
                highlighted: item === _this.scope.highlighted
              };
            };
          })(this);
          return this.scope.columnWidth = function(column) {
            return {
              width: column.width
            };
          };
        };

        function Grid(scope, element, attrs, ctrl, transclude, $timeout) {
          this.scope = scope;
          this.element = element;
          this.attrs = attrs;
          this.ctrl = ctrl;
          this.transclude = transclude;
          this.scope.hideHeader = attrs.hideHeader;
          this.xls_export = new XLSExport(attrs.name, scope.columns, scope.data);
          this.scope.exportCSV = (function(_this) {
            return function() {
              _this.xls_export.data = _this.scope.source.data;
              _this.xls_export.columns = _this.scope.columns;
              _this.xls_export.file_name = attrs.name;
              return _this.xls_export.doExport(_this.scope, $timeout);
            };
          })(this);
        }

        return Grid;

      })();
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridControllers', ['goGridDiacritics']).controller('GoGridController', [
    '$scope', 'storage', 'removeDiacritics', function($scope, storage, removeDiacritics) {
      $scope.columnsDef = [];
      $scope.columns = [];
      $scope.viewParams = {
        sort_by: [],
        page: 1,
        pageSize: 1,
        length: 0,
        filtersVisible: true,
        filters: {},
        sort_columns: {}
      };
      $scope.saved_filter_values = storage.get($scope.name + '.filter_values') || {};
      $scope.highlight = function(item) {
        $scope.highlighted = item;
        if ($scope.onSelect) {
          return $scope.onSelect(item);
        }
      };
      $scope.filter = function() {
        var filter, filters, list, name;
        filters = $scope.viewParams.filters;
        list = $scope.source.data || [];
        if (filters) {
          for (name in filters) {
            filter = filters[name];
            if (filter.type === 'text' && filter.exp) {
              list = list.filter(function(item) {
                var field, i, test_string, _i, _len, _ref;
                test_string = [];
                _ref = filter.fields;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  field = _ref[_i];
                  test_string.push(item[field]);
                }
                i = filter.exp.test(test_string.join(' '));
                if (!i) {
                  item.__go_grid_hidden = true;
                } else {
                  item.__go_grid_hidden = false;
                }
                return i;
              });
            }
            if (filter.type === 'check' && !filter.value) {
              list = list.filter(function(item) {
                var i;
                i = item[filter.field].toString() === filter.selected;
                if (i) {
                  item.__go_grid_hidden = false;
                } else {
                  item.__go_grid_hidden = true;
                }
                return i;
              });
            }
            if (filter.type === 'list' && (filter.value || []).length > 0) {
              list = list.filter(function(item) {
                var i;
                i = filter.value.indexOf(item[filter.field]) >= 0;
                if (!i) {
                  item.__go_grid_hidden = true;
                } else {
                  item.__go_grid_hidden = false;
                }
                return i;
              });
            }
          }
          if (list.length < $scope.viewParams.length) {
            $scope.viewParams.page = 1;
          }
          $scope.viewParams.length = list.length;
        }
        $scope.filtered = list;
        $scope.sort();
        if ($scope.viewParams.infinite) {
          return $scope.infinite();
        }
      };
      $scope.sort = function() {
        var field, item, list, sortBy, toStringFn, _i, _j, _len, _len1;
        list = $scope.filtered;
        if ($scope.viewParams.sort_by.length && list.length > 1) {
          sortBy = $scope.viewParams.sort_by[0].column;
          field = list[0][sortBy];
          if ($.isNumeric(field)) {
            toStringFn = function() {
              return ('000000000000000000000000000000' + this[sortBy].toFixed(20)).substr(-51);
            };
          } else {
            toStringFn = function() {
              return removeDiacritics(this[sortBy] || '').toLowerCase();
            };
          }
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            item = list[_i];
            item.toString = toStringFn;
          }
          list = list.sort();
          for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
            item = list[_j];
            delete item.toString;
          }
          if ($scope.viewParams.sort_by[0].direction < 0) {
            return $scope.filtered = list.reverse();
          } else {
            return $scope.filtered = list;
          }
        }
      };
      return $scope.infinite = function() {
        var end, list, start;
        list = $scope.filtered;
        if ($scope.viewParams.infinite) {
          start = 0;
          if (parseInt($scope.viewParams.page) > 2) {
            start = (parseInt($scope.viewParams.page) - 2) * $scope.viewParams.pageSize;
          }
          if (start < 0) {
            start = 0;
          }
          end = (parseInt($scope.viewParams.page) + 1) * $scope.viewParams.pageSize;
          list = list.slice(start, end);
        }
        return $scope.truncated = list;
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridFilters', []).directive('filters', [
    '$compile', function($compile) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          scope.filters = [];
          return scope.viewParams.filtersTpl = element.html();
        }
      };
    }
  ]).directive('multiFilter', [
    '$compile', 'storage', '$timeout', function($compile, storage, $timeout) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var tpl, _base, _base1;
          tpl = '<select multiselect multiple="multiple" ng-model="viewParams.filters.' + (attrs.field || attrs.name) + '.value" ng-options="item.id as item.label for item in ' + attrs.items + '"></select>';
          if (!((_base = scope.viewParams).filters || (_base.filters = {}))[attrs.name]) {
            ((_base1 = scope.viewParams).filters || (_base1.filters = {}))[attrs.name] = {
              type: 'list',
              field: attrs.name,
              value: []
            };
            $timeout(function() {
              var _base2;
              ((_base2 = scope.viewParams).filters || (_base2.filters = {}))[attrs.name].value = storage.get(scope.name + '_filter_' + attrs.name);
              return scope.$watch('viewParams.filters.' + attrs.name + '.value', function(o, v) {
                scope.filter();
                return storage.set(scope.name + '_filter_' + attrs.name, o);
              });
            }, 30);
            return element.html(tpl);
          }
        }
      };
    }
  ]).directive('searchFilter', [
    '$compile', 'storage', '$timeout', function($compile, storage, $timeout) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var tpl, _base, _base1;
          tpl = '<input class="form-control" ng-model="viewParams.filters.' + attrs.name + '.value" />';
          if (!((_base = scope.viewParams).filters || (_base.filters = {}))[attrs.name]) {
            ((_base1 = scope.viewParams).filters || (_base1.filters = {}))[attrs.name] = {
              type: 'text',
              fields: attrs.fields.split(','),
              name: attrs.name,
              value: ''
            };
            element.html(tpl);
            return $timeout(function() {
              var e, t, _base2;
              ((_base2 = scope.viewParams).filters || (_base2.filters = {}))[attrs.name].value = storage.get(scope.name + '_filter_' + attrs.name) || '';
              t = scope.viewParams.filters[attrs.name].value.replace('%', '(.)+');
              t = '(?=.*' + t.split('&').join(')(?=.*') + ')';
              try {
                scope.viewParams.filters[attrs.name].exp = new RegExp("(" + t + ")", 'i');
              } catch (_error) {
                e = _error;
                true;
              }
              scope.filter();
              return scope.$watch('viewParams.filters.' + attrs.name + '.value', function(o, v) {
                if (o !== v) {
                  storage.set(scope.name + '_filter_' + attrs.name, o);
                  t = scope.viewParams.filters[attrs.name].value.replace('%', '(.)+');
                  t = '(?=.*' + t.split('&').join(')(?=.*') + ')';
                  try {
                    scope.viewParams.filters[attrs.name].exp = new RegExp("(" + t + ")", 'i');
                  } catch (_error) {
                    e = _error;
                    true;
                  }
                  return scope.filter();
                }
              });
            }, 100);
          }
        }
      };
    }
  ]).directive('checkFilter', [
    '$compile', function($compile) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var tpl, _base, _base1;
          tpl = '<button class="btn btn-default" ng-click="viewParams.filters.' + attrs.name + '.value = !viewParams.filters.' + attrs.name + '.value"><span class="fa" ng-class="{\'fa-square-o\': !viewParams.filters.' + attrs.name + '.value,\'fa-check-square-o\': viewParams.filters.' + attrs.name + '.value}"></span> ' + attrs.label + '</button>';
          if (!((_base = scope.viewParams).filters || (_base.filters = {}))[attrs.name]) {
            scope.$watch('viewParams.filters.' + attrs.name + '.value', function(o, v) {
              if (o !== v) {
                return scope.filter();
              }
            });
            ((_base1 = scope.viewParams).filters || (_base1.filters = {}))[attrs.name] = {
              type: 'check',
              field: attrs.field,
              name: attrs.name,
              value: attrs.initial || false,
              selected: attrs.value
            };
            return element.html(tpl);
          }
        }
      };
    }
  ]).directive('filtersContainer', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        compile: function(element) {
          return function(scope, element, attrs) {
            element.html('<div ng-include="\'filters_container.html\'"></div>');
            element.append(scope.viewParams.filtersTpl);
            return $compile(element.contents())(scope);
          };
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridTemplates', []).run([
    '$templateCache', function($templateCache) {
      $templateCache.put('grid_column.html', "<div ng-style=\"{width: column.width}\">" + "<span class=\"header-label\">{{ ::column.header }}</span>" + "<span ng-if=\"::column.sortable\" class=\"sorting-arrows fa\" ng-class=\"{'fa-unsorted': viewParams.sort_by[0].column != column.name, 'fa-sort-up': viewParams.sort_by[0].column == column.name && viewParams.sort_by[0].direction == 1, 'fa-sort-desc': viewParams.sort_by[0].column == column.name && viewParams.sort_by[0].direction == -1}\">" + "</span>" + "</div>");
      $templateCache.put('filters_container.html', "<div class=\"go-grid-column-list\">" + "<button class=\"btn btn-default\" type=\"button\" data-toggle=\"dropdown\">" + "<span class=\"fa fa-cogs\"></span>" + "</button>" + "<ul class=\"dropdown-menu pull-right\" role=\"menu\">" + "<li><a href=\"javascript:void(0)\" ng-click=\"resetStorage()\">Reset ustawień</a></li>" + "<li class=\"dropdown-header\"><strong>Kolumny</strong></li>" + "<li ng-repeat=\"(index, column) in columns\">" + "<column-config>" + "</column-config>" + "</li>" + "</ul> " + '<button class="btn btn-default" ng-click="exportCSV()"><span class="fa fa-cloud-download"></span></button>' + '&nbsp;' + '<button class="btn btn-default" ng-click="refresh()" ng-if="refresh "><span class="fa fa-refresh"></span></button>' + "</div>");
      return $templateCache.put('grid_base.html', "<div class=\"go-grid-table\">" + "<div class=\"go-grid-filters form-inline\" ng-if=\"::viewParams.filtersVisible\" filters-container>" + "</div>" + "<div class=\"go-grid-table-header\">" + "<table>" + "<thead>" + '<tr>' + '<th column-header column="column" ng-repeat="column in columnGroups" colspan="{{column.span}}" rowspan="{{column.type == \'group\' ? 1 : 2}}" ng-class="{group: column.type == \'group\'}"></th>' + "<th style=\"width: 100%; min-width: 50px\" rowspan=\"2\"></th>" + '</tr>' + "<tr>" + "<th column-header ng-repeat=\"column in columnsGroupped\" column=\"column\"></th>" + "</tr>" + "</thead>" + "</table>" + "</div>" + "<div class=\"go-grid-table-body\" scroll-table>" + "<div>" + "<table>" + "<tbody>" + "<tr ng-repeat=\"(row_index,item) in truncated track by $index\" ng-class=\"rowClass(item)\">" + "<td ng-repeat=\"column in columns\" go-cell ng-if=\"column.visible\" ngs-click=\"highlight(item)\"" + " ng-style=\"cellStyle(item, column)\">" + "</td>" + "<td style=\"width: 100%\" ng-style=\"emptyCellStyle(item)\"></td>" + "</tr>" + "</tbody>" + "</table>" + "</div>" + "</div>" + "</div>" + "\n");
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridColumns', []).directive('columns', [
    '$parse', '$timeout', function($parse, $timeout) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var c, _i, _len, _ref;
          if (attrs.source != null) {
            _ref = $parse(attrs.source)(scope);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              c = _ref[_i];
              if (typeof c.sortable === 'undefined') {
                c.sortable = true;
              }
              if (typeof c.resizable === 'undefined') {
                c.resizable = true;
              }
              if (typeof c.hidden === 'undefined') {
                c.visible = false;
              }
              c.visible = (c.hidden == null) && c.hidden !== 'false';
              c.template || (c.template = '');
              scope.columnsDef.push(c);
            }
          }
          return true;
        }
      };
    }
  ]).directive('column', [
    function() {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var tpl;
          tpl = attrs.template || element.html();
          tpl = tpl.replace(/go-(ng-repeat|ng-href)/g, '$1');
          scope.columnsDef.push({
            name: attrs.name,
            width: attrs.width,
            header: attrs.header,
            sort: attrs.sort,
            sortable: (attrs.sort != null) && attrs.sort !== 'false',
            visible: (attrs.hidden == null) && attrs.hidden !== 'false',
            resizable: (attrs.resize != null) && attrs.resize !== 'false',
            template: tpl,
            group: attrs.group || '',
            right: (attrs.right != null) && attrs.right !== 'false'
          });
          if (attrs.sortDefault != null) {
            scope.viewParams.sort_by = [
              {
                column: attrs.sort || attrs.name,
                direction: 1
              }
            ];
            scope.viewParams.sort_columns = {};
            return scope.viewParams.sort_columns[attrs.sort || attrs.name] = 1;
          }
        }
      };
    }
  ]).directive('checkboxColumn', [
    function() {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var field;
          field = attrs.field || 'selected';
          return scope.columnsDef.push({
            field: field,
            visible: attrs.hidden == null,
            width: attrs.width,
            header: 'Operacje grupowe',
            type: 'checkbox',
            name: attrs.name || 'checkbox',
            template: '<input type="checkbox" class="checkbox" ng-model="item.' + field + '" />'
          });
        }
      };
    }
  ]).directive('columnHeader', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        templateUrl: 'grid_column.html',
        link: function(scope, element, attrs) {
          var sort_by;
          if (scope.column.right) {
            element.addClass('text-right');
          }
          if (scope.column.type === 'checkbox') {
            element.html('<div style="width: ' + scope.column.width + 'px; padding: 0 0 0 6px"><input type="checkbox" class="checkbox" /></div>');
            return element.find('input').on('click', function() {
              var item, _i, _j, _len, _len1, _ref, _ref1;
              _ref = scope.filtered;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                item = _ref[_i];
                item[scope.column.field] = false;
              }
              if ($(this).prop('checked')) {
                _ref1 = scope.filtered;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  item = _ref1[_j];
                  item[scope.column.field] = true;
                }
              }
              scope.$apply();
              return true;
            });
          } else {
            if (scope.column.resizable) {
              $(element).children('div').resizable({
                handles: 'e',
                stop: function() {
                  scope.$parent.$broadcast('columnResize');
                  return scope.$apply((function(_this) {
                    return function() {
                      return scope.column.width = $(_this).width() + 8;
                    };
                  })(this));
                }
              });
            }
            if (scope.column.sortable) {
              element.addClass('sortable');
              sort_by = scope.column.sort || scope.column.name;
              return $(element).on('click', function(e) {
                scope.$apply(function() {
                  var direction, existing, _base;
                  existing = scope.viewParams.sort_by.filter(function(i) {
                    return i.column === sort_by;
                  })[0];
                  if (existing) {
                    direction = parseInt(existing.direction) || 1;
                  } else {
                    direction = -1;
                  }
                  if (false) {
                    if (existing) {
                      existing.direction = direction * (-1);
                    } else {
                      scope.viewParams.sort_by.push({
                        column: sort_by,
                        direction: direction * (-1)
                      });
                    }
                  } else {
                    scope.viewParams.sort_by = [];
                    (_base = scope.viewParams.sort_by)[0] || (_base[0] = {});
                    scope.viewParams.sort_by[0].column = sort_by;
                    scope.viewParams.sort_by[0].direction = direction * (-1);
                    scope.viewParams.sort_columns = {};
                  }
                  scope.viewParams.sort_columns[sort_by] = direction * (-1);
                  scope.sort();
                  return scope.infinite();
                });
                e.preventDefault();
                return false;
              });
            }
          }
        }
      };
    }
  ]).directive('columnConfig', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        template: ['<div class="column-config">', '<a class="checkbox-link" href="javascript:void(0)" ng-click="column.visible = !column.visible">', ' <span class="fa fw" ng-class="{\'fa-check-square-o\': column.visible, \'fa-square-o\': !column.visible}" ng-click="column.visible = !column.visible">', '</span>', ' {{column.header }}', '</a>', "<div class=\"sort-icons\">", "<span class=\"fa fa-chevron-up\" ng-click=\"moveColumnUp()\"></span><span class=\"fa fa-chevron-down\" ng-click=\"moveColumnDown()\"></span>", '</div>', '</div>'].join(''),
        link: function(scope, element) {
          scope.moveColumnUp = function() {
            var el, index;
            index = scope.columns.indexOf(scope.column);
            if (index >= 0) {
              el = scope.columns.splice(index, 1)[0];
              return scope.columns.splice(index - 1, 0, el);
            }
          };
          scope.moveColumnDown = function() {
            var el, index;
            index = scope.columns.indexOf(scope.column);
            if (index >= 0) {
              el = scope.columns.splice(index, 1)[0];
              return scope.columns.splice(index + 1, 0, el);
            }
          };
          $(element).find('a').on('click', function(e) {
            e.preventDefault();
            return false;
          });
          return $(element).find('span.fa').on('click', function(e) {
            e.preventDefault();
            return false;
          });
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridScroll', []).directive('scrollTable', [
    '$timeout', function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var calculatePageSize, header_el, lastScrollTop, resize;
          header_el = element.parent().find('.go-grid-table-header');
          calculatePageSize = function() {
            var row_height;
            row_height = ($(element).find('td ').height() || 30) + 3;
            return scope.viewParams.pageSize = Math.round($(element).height() / row_height);
          };
          $(window).resize(function() {
            if ($.contains(document.documentElement, element[0])) {
              calculatePageSize();
              resize();
              return scope.$apply();
            }
          });
          resize = function() {
            var filter_el, filters_height, header_height;
            filter_el = element.parent().find('.go-grid-filters');
            header_height = header_el.height();
            filters_height = filter_el.height() + 8;
            element.css({
              top: header_height + filters_height
            });
            return calculatePageSize();
          };
          $timeout(function() {
            return resize();
          }, 10);
          scope.$watch('source.data', function(n) {
            var active, index;
            if (n) {
              active = scope.source.data.filter(function(i) {
                return i.active;
              })[0];
              index = scope.source.data.indexOf(active);
              if (index >= 0) {
                return setTimeout(function() {
                  var row_height;
                  row_height = ($(element).find('td ').height() || 30) + 1;
                  if (scope.viewParams.pageSize - 1 < index) {
                    return element.scrollTop((index + 2 - scope.viewParams.pageSize) * row_height + 5);
                  }
                }, 200);
              }
            }
          });
          scope.$watch('columns', function() {
            return $timeout(function() {
              return resize();
            }, 200);
          }, true);
          scope.$on('columnResize', function() {
            return resize();
          });
          lastScrollTop = element.scrollTop();
          return element.on('scroll', function(e) {
            var new_page, row_height;
            header_el.scrollLeft($(this).scrollLeft());
            if (lastScrollTop !== element.scrollTop()) {
              lastScrollTop = element.scrollTop();
              row_height = ($(element).find('td ').height() || 30) + 1;
              if (scope.viewParams.infinite) {
                new_page = Math.round($(this).scrollTop() / row_height / scope.viewParams.pageSize) + 1;
                if (new_page !== scope.viewParams.page) {
                  return scope.$apply((function(_this) {
                    return function() {
                      scope.viewParams.page = new_page;
                      if (scope.viewParams.page < 0) {
                        scope.viewParams.page = 0;
                      }
                      if (scope.viewParams.page > scope.source.data.length / scope.viewParams.pageSize) {
                        scope.viewParams.page = Math.round(scope.source.data.length / scope.viewParams.pageSize);
                      }
                      return scope.infinite();
                    };
                  })(this));
                }
              }
            }
          });
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('goGridXLSExporter', []).service('XLSExport', [
    '$interpolate', function($interpolate) {
      var XLSExport;
      return XLSExport = (function() {
        function XLSExport(file_name, columns, data) {
          this.file_name = file_name;
          this.columns = columns;
          this.data = data;
        }

        XLSExport.prototype.doExport = function() {
          var cell, cell_ref, col, col_ref, column, column_index, columns, i, item, max_col, row_index, s2ab, t, wb, wbout, ws, ws_name, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
          ws = {};
          columns = [];
          _ref = this.columns;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            column = _ref[i];
            if (column.visible && column.type !== 'checkbox') {
              columns.push({
                header: column.header,
                index: i,
                field: column.name,
                template: column.template,
                width: column.width
              });
            }
          }
          column_index = 0;
          col_ref = [];
          for (_j = 0, _len1 = columns.length; _j < _len1; _j++) {
            col = columns[_j];
            cell_ref = XLSX.utils.encode_cell({
              c: column_index,
              r: 0
            });
            cell = {
              v: col.header,
              t: 's'
            };
            ws[cell_ref] = cell;
            column_index++;
            col_ref.push({
              wpx: col.width
            });
          }
          ws['!cols'] = col_ref;
          row_index = 1;
          max_col = 0;
          (_base = XLSX.SSF._table)[50] || (_base[50] = 'YYYY/MM/DD');
          _ref1 = this.data;
          for (i = _k = 0, _len2 = _ref1.length; _k < _len2; i = ++_k) {
            item = _ref1[i];
            column_index = 0;
            for (_l = 0, _len3 = columns.length; _l < _len3; _l++) {
              col = columns[_l];
              cell_ref = XLSX.utils.encode_cell({
                c: column_index,
                r: row_index
              });
              cell = {
                v: item[col.field] || '',
                t: 's'
              };
              if ($.isNumeric(cell.v)) {
                cell.t = 'n';
              } else if (moment(item[col.field]).isValid() && (item[col.field] != null)) {
                cell.t = 'n';
                cell.z = XLSX.SSF._table[50];
                cell.v = (moment(item[col.field]).toDate() - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
              }
              if (col.template && cell.t === 's') {
                cell.v = $interpolate(col.template)({
                  item: item
                }).replace(/(<([^>]+)>)/ig, "").trim();
                cell.h = $interpolate(col.template)({
                  item: item
                });
              }
              ws[cell_ref] = cell;
              if (column_index > max_col) {
                max_col = column_index;
              }
              column_index++;
            }
            row_index++;
          }
          ws['!ref'] = XLSX.utils.encode_range({
            s: {
              c: 0,
              r: 0
            },
            e: {
              c: max_col,
              r: row_index - 1
            }
          });
          ws_name = 'export';
          wb = {
            SheetNames: [ws_name],
            Sheets: {}
          };
          wb.Sheets[ws_name] = ws;
          wbout = XLSX.write(wb, {
            bookType: 'xlsx',
            bookSST: true,
            type: 'binary'
          });
          s2ab = function(s) {
            var buf, char, view, _len4, _m;
            buf = new ArrayBuffer(s.length);
            view = new Uint8Array(buf);
            for (i = _m = 0, _len4 = s.length; _m < _len4; i = ++_m) {
              char = s[i];
              view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
          };
          t = s2ab(wbout);
          setTimeout(function() {
            return saveAs(new Blob([t], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }), "" + (moment().format("YYYYMMDDHHmmss")) + "-" + this.file_name + ".xlsx");
          }, 500);
          return true;
        };

        return XLSExport;

      })();
    }
  ]);

}).call(this);


/*2014-10-23
  <div go-grid data-source="source_array">
    <checkbox-column width="column width" field="field to set true/false on click"></checkbox-column>
    ...
    <column width="column_width" name="item filed name" header="header display">
      [html code for template] use {{ item.anything }}
  if empty <div>{{ item[attr.name] will be used</div>
  </column>
    ...
  </div>
 */

(function() {
  angular.module('goGrid', ['goGridControllers', 'goGridFilters', 'goGridClass', 'goGridTemplates', 'goGridScroll', 'goGridColumns']).directive('goGrid', [
    '$compile', '$parse', '$timeout', 'storage', '$interpolate', 'gridClass', function($compile, $parse, $timeout, storage, $interpolate, gridClass) {
      return {
        restrict: 'A',
        scope: true,
        controller: 'GoGridController',
        link: function(scope, element, attrs, ctrl, transclude) {
          var obj;
          scope.name = $parse(attrs.name)(scope);
          obj = new gridClass(scope, element, attrs, ctrl, transclude, $timeout);
          obj.buildColumns(storage);
          obj.groupColumns();
          scope.$watch('columns', function() {
            return obj.watchColumns(storage);
          }, true);
          if (attrs.onSelect) {
            scope.onSelect = scope[attrs.onSelect.replace('()', '')];
          }
          if (!scope.onSelect) {
            scope.onSelect = function(item) {
              var i, _i, _len, _ref;
              _ref = scope.source.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                delete i.active;
              }
              return item.active = true;
            };
          }
          scope.source = {
            data: $parse(attrs.source)(scope)
          };
          scope.filtered = scope.source.data;
          scope.viewParams.infinite = attrs.infinite != null;
          scope.sort();
          scope.resetStorage = function() {
            storage.set(scope.name + '.columns', null);
            return true;
          };
          scope.$watch(attrs.source, function() {
            return obj.watchSource($parse);
          });
          obj.cellStyleSetters();
          scope.$watch('source.data.$trigger', function() {
            return scope.filter();
          });
          scope.$watch('source.data.$resolved', function() {
            scope.viewParams.length = scope.source.data.length;
            return scope.filter();
          });
          if (scope.viewParams.infinite) {
            obj.infiniteScroll($timeout);
          } else {
            scope.truncated = scope.filtered;
          }
          element.html('<div ng-include="\'grid_base.html\'"></div>');
          return $compile(element.contents())(scope);
        }
      };
    }
  ]).directive('goCell', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var classes, ntpl, pref, tpl;
          tpl = scope.column.template;
          if (tpl === '') {
            pref = '';
            if (scope.read_only) {
              pref = '::';
            }
            tpl = '{{ ' + pref + 'item.' + scope.column.name + ' }}';
          }
          classes = [];
          if (scope.column.right) {
            classes.push('text-right');
          }
          ntpl = '<div';
          if (scope.column.type !== 'checkbox') {
            ntpl += ' ng-click="highlight(item)"';
          }
          ntpl += ' ng-style="columnWidth(column)"';
          ntpl += " class=\"" + (classes.join(' ')) + "\">" + tpl + "</div>";
          element.html(ntpl);
          return $compile(element.contents())(scope);
        }
      };
    }
  ]);

}).call(this);
