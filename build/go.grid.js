
/*
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
  angular.module('go.grid.filters', []);

  angular.module('go.grid.controllers', []);

  angular.module('go.grid', ['go.grid.controllers', 'go.grid.filters', 'angularLocalStorage']);

  angular.module('go.grid').locales = {
    en: {
      reset_settings: 'Reset settings',
      columns: 'Columns',
      checkbox_column: 'Checkbox'
    },
    pl: {
      reset_settings: 'Reset ustawień',
      columns: 'Kolumny',
      checkbox_column: 'Operacje grupowe'
    }
  };

  angular.module('go.grid').t = function(code) {
    var table;
    table = angular.module('go.grid').locales[angular.module('go.grid').locale || 'en'];
    if (table && table[code]) {
      return table[code];
    } else {
      return code;
    }
  };

  angular.module('go.grid.filters').filter('translate', function() {
    return function(text) {
      return angular.module('go.grid').t(text);
    };
  });

  angular.module('go.grid.controllers').controller('goGridController', [
    '$scope', function($scope) {
      var compareFn, measure;
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
      measure = 0;
      $scope.startMeasure = function() {
        console.log('start test');
        return measure = (new Date()).getTime();
      };
      $scope.endMeasure = function() {
        return console.log((new Date()).getTime() - measure);
      };
      $scope.highlight = function(item) {
        $scope.highlighted = item;
        if ($scope.onSelect) {
          return $scope.onSelect(item);
        }
      };
      $scope.filter = function() {
        var filter, filters, list, name;
        filters = $scope.viewParams.filters;
        list = $scope.source;
        if (filters) {
          for (name in filters) {
            filter = filters[name];
            if (filter.type = 'text' && filter.exp) {
              list = list.filter(function(item) {
                var field, test_string, _i, _len, _ref;
                test_string = [];
                _ref = filter.fields;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  field = _ref[_i];
                  test_string.push(item[field]);
                }
                return filter.exp.test(test_string.join(' '));
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
      compareFn = function(item, sortBy) {
        if (sortBy && item[sortBy]) {
          if ($.isNumeric(item[sortBy])) {
            return ('0000000000000000000000000' + item[sortBy]).slice(-24);
          } else {
            return item[sortBy].toLowerCase();
          }
        } else {
          return '';
        }
      };
      $scope.sort = function() {
        var list, sortBy;
        list = $scope.filtered;
        if ($scope.viewParams.sort_by.length) {
          sortBy = $scope.viewParams.sort_by[0].column;
          list = list.sort(function(a, b) {
            var ac, bc;
            ac = compareFn(a, sortBy);
            bc = compareFn(b, sortBy);
            if (ac > bc) {
              return 1;
            } else if (ac < bc) {
              return -1;
            } else {
              return 0;
            }
          });
          if ($scope.viewParams.sort_by[0].direction < 0) {
            $scope.filtered = list.reverse();
          } else {
            $scope.filtered = list;
          }
        }
        return true;
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

  angular.module('go.grid').directive('goGrid', [
    '$compile', '$parse', '$timeout', 'storage', '$interpolate', function($compile, $parse, $timeout, storage, $interpolate) {
      return {
        restrict: 'A',
        scope: true,
        controller: 'goGridController',
        compile: function(element, attrs) {
          var columns;
          columns = storage.get(attrs.name + '.columns') || {};
          return function(scope, element, attrs, ctrl, transclude) {
            var column, column_data, name, new_columns, _i, _len, _ref;
            new_columns = [];
            for (name in columns) {
              column = columns[name];
              new_columns[column.index] = null;
            }
            _ref = scope.columnsDef;
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
            scope.columns = new_columns.filter(function(i) {
              return i;
            });
            scope.exportCSV = function() {
              var cell, cell_ref, col, col_ref, column_index, i, item, max_col, row_index, s2ab, t, wb, wbout, ws, ws_name, _base, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _ref1, _ref2;
              ws = {};
              columns = [];
              _ref1 = scope.columns;
              for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
                column = _ref1[i];
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
              for (_k = 0, _len2 = columns.length; _k < _len2; _k++) {
                col = columns[_k];
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
              _ref2 = scope.source;
              for (i = _l = 0, _len3 = _ref2.length; _l < _len3; i = ++_l) {
                item = _ref2[i];
                column_index = 0;
                for (_m = 0, _len4 = columns.length; _m < _len4; _m++) {
                  col = columns[_m];
                  cell_ref = XLSX.utils.encode_cell({
                    c: column_index,
                    r: row_index
                  });
                  cell = {
                    v: item[col.field],
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
                var buf, char, view, _len5, _n;
                buf = new ArrayBuffer(s.length);
                view = new Uint8Array(buf);
                for (i = _n = 0, _len5 = s.length; _n < _len5; i = ++_n) {
                  char = s[i];
                  view[i] = s.charCodeAt(i) & 0xFF;
                }
                return buf;
              };
              t = s2ab(wbout);
              $timeout(function() {
                return saveAs(new Blob([t], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }), "20320389233test.xlsx");
              }, 500);
              return true;
            };
            scope.$watch('columns', function() {
              var d, i, _j, _len1, _ref1;
              d = {};
              _ref1 = scope.columns;
              for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
                column = _ref1[i];
                d[column.name] = {
                  visible: column.visible,
                  width: column.width,
                  index: i
                };
              }
              return storage.set(attrs.name + '.columns', d);
            }, true);
            scope.name = attrs.name;
            scope.onSelect = scope[attrs.onSelect.replace('()', '')];
            scope.source = $parse(attrs.source)(scope);
            scope.filtered = scope.source;
            scope.viewParams.infinite = attrs.infinite != null;
            scope.sort();
            scope.resetStorage = function() {
              scope.columns = scope.columnsDef;
              storage.set(attrs.name + '.columns', null);
              return true;
            };
            if (scope.viewParams.infinite) {
              scope.$watch('source', function() {
                return scope.viewParams.length = scope.source.length;
              });
              scope.$watch('viewParams.pageSize', function(o, v) {
                if (o !== v) {
                  return scope.infinite();
                }
              });
              scope.$watch('viewParams.length', function() {
                return $timeout(function() {
                  var row_height;
                  row_height = $(element).find('.go-grid-table-body td').height() || 30;
                  $(element).find('.go-grid-table-body > div').height(scope.viewParams.length * row_height);
                  return $(element).find('.go-grid-table-body').scrollTop(0);
                }, 10);
              });
              scope.$watch('viewParams.page', function() {
                var margin, row_height;
                if (parseInt(scope.viewParams.page) > 2) {
                  row_height = ($(element).find('.go-grid-table-body table td ').height() || 30) + 1;
                  margin = row_height * scope.viewParams.pageSize * (parseInt(scope.viewParams.page) - 2);
                  return $(element).find('.go-grid-table-body > div').css({
                    paddingTop: margin
                  });
                } else {
                  return $(element).find('.go-grid-table-body > div').css({
                    paddingTop: 0
                  });
                }
              });
            } else {
              scope.truncated = scope.filtered;
            }
            element.html('<div ng-include="\'grid_base.html\'"></div>');
            return $compile(element.contents())(scope);
          };
        }
      };
    }
  ]).directive('column', [
    function() {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          scope.columnsDef.push({
            name: attrs.name,
            width: attrs.width,
            header: attrs.header,
            sort: attrs.sort,
            sortable: attrs.sort != null,
            visible: attrs.hidden == null,
            resizable: (attrs.resize != null) && $().resizablee,
            template: element.html(),
            right: attrs.right != null
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
  ]).directive('filters', [
    '$compile', function($compile) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          scope.filters = [];
          return scope.filtersTpl = element.html();
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
            element.append(scope.filtersTpl);
            return $compile(element.contents())(scope);
          };
        }
      };
    }
  ]).directive('searchFilter', [
    '$compile', function($compile) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var tpl, _base, _base1;
          tpl = '<input class="form-control" ng-model="viewParams.filters.' + attrs.name + '.value" />';
          if (!((_base = scope.viewParams).filters || (_base.filters = {}))[attrs.name]) {
            scope.$watch('viewParams.filters.' + attrs.name + '.value', function(o, v) {
              var e, t;
              if (o !== v) {
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
            ((_base1 = scope.viewParams).filters || (_base1.filters = {}))[attrs.name] = {
              type: 'text',
              fields: attrs.fields.split(','),
              name: attrs.name,
              value: ''
            };
            element.html(tpl);
            return $compile(element.contents())(scope);
          }
        }
      };
    }
  ]).directive('columnHeader', [
    '$compile', function($compile) {
      var findBy;
      findBy = function(ar, field, value) {
        var a;
        a = ar.filter(function(i) {
          return i[field] === value;
        })[0];
        return a || false;
      };
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
              var sel;
              if ($(this).prop('checked')) {
                sel = true;
              } else {
                sel = false;
              }
              scope.$apply(function() {
                var item, _i, _len, _ref, _results;
                _ref = scope.source;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  item = _ref[_i];
                  _results.push(item[scope.column.field] = sel);
                }
                return _results;
              });
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
                scope.startMeasure();
                scope.$apply(function() {
                  var direction, existing, _base;
                  existing = findBy(scope.viewParams.sort_by, 'column', sort_by);
                  if (existing) {
                    direction = existing.direction;
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
  ]).directive('checkboxColumn', [
    function() {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          return scope.columnsDef.push({
            field: attrs.field,
            visible: attrs.hidden == null,
            width: attrs.width,
            header: angular.module('go.grid').t('checkbox_column'),
            type: 'checkbox',
            name: attrs.name || 'checkbox',
            template: '<input type="checkbox" class="checkbox" ng-model="item.' + attrs.field + '" />'
          });
        }
      };
    }
  ]).directive('goCell', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        compile: function(element) {
          return function(scope, element) {
            var classes, tpl;
            tpl = scope.column.template;
            if (tpl === '') {
              tpl = '{{item[column.name]}}';
            }
            classes = [];
            if (scope.column.right) {
              classes.push('text-right');
            }
            tpl = "<div ng-style=\"{width: column.width}\" class=\"" + (classes.join(' ')) + "\">" + tpl + "</div>";
            element.html(tpl);
            $compile(element.contents())(scope);
            return element.on('click', (function(_this) {
              return function(e) {
                scope.editing = true;
                if (scope.column.type === 'checkbox') {
                  return e.stopPropagation();
                }
              };
            })(this));
          };
        }
      };
    }
  ]).directive('scrollTable', [
    '$timeout', function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var calculatePageSize, header_el, lastScrollTop, resize;
          header_el = element.parent().find('.go-grid-table-header');
          calculatePageSize = function() {
            var row_height;
            row_height = ($(element).find('td ').height() || 30) + 1;
            return scope.viewParams.pageSize = Math.round($(element).height() / row_height);
          };
          $(window).resize(function() {
            return calculatePageSize();
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
                      if (scope.viewParams.page > scope.source.length / scope.viewParams.pageSize) {
                        scope.viewParams.page = Math.round(scope.source.length / scope.viewParams.pageSize);
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
  ]).directive('columnConfig', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        template: ['<div class="column-config">', '<a class="checkbox-link" href="javascript:void(0)" ng-click="column.visible = !column.visible">', ' <span class="fa" ng-class="{\'fa-check-square-o\': column.visible, \'fa-square-o\': !column.visible}">', '</span>', ' {{column.header }}', '</a>', "<div class=\"sort-icons\">", "<span class=\"fa fa-chevron-up\" ng-click=\"moveColumnUp()\"></span><span class=\"fa fa-chevron-down\" ng-click=\"moveColumnDown()\"></span>", '</div>', '</div>'].join(''),
        link: function(scope, element) {
          scope.moveColumnUp = function() {
            var index;
            index = scope.columns.indexOf(scope.column);
            if (index >= 0) {
              return scope.columns.moveUp(index);
            }
          };
          scope.moveColumnDown = function() {
            var index;
            index = scope.columns.indexOf(scope.column);
            if (index >= 0) {
              return scope.columns.moveDown(index);
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
  ]).run([
    '$templateCache', function($templateCache) {
      $templateCache.put('grid_column.html', "<div ng-style=\"{width: column.width}\">" + "<span class=\"header-label\">{{ column.header }}</span>" + "<span ng-if=\"column.sortable\" class=\"sorting-arrows fa\" ng-class=\"{'fa-unsorted': !viewParams.sort_columns[column.name], 'fa-sort-up': viewParams.sort_columns[column.name] == 1, 'fa-sort-desc': viewParams.sort_columns[column.name] == -1}\">" + "</span>" + "" + "</div>");
      $templateCache.put('filters_container.html', "<div class=\"go-grid-column-list btn-group\">" + "<button class=\"btn btn-default\" type=\"button\" data-toggle=\"dropdown\">" + "<span class=\"fa fa-cogs\"></span>" + "</button>" + "<ul class=\"dropdown-menu pull-right\" role=\"menu\">" + "<li><a href=\"javascript:void(0)\" ng-click=\"resetStorage()\">" + '{{\'reset_settings\' | translate }}' + "</a></li>" + "<li class=\"dropdown-header\"><strong>" + '{{\'columns\' | translate }}' + "</strong></li>" + "<li ng-repeat=\"(index, column) in columns\">" + "<column-config>" + "</column-config>" + "</li>" + "</ul>" + '<button class="btn btn-default" ng-click="exportCSV()"><span class="fa fa-cloud-download"></span></button>' + "</div>");
      return $templateCache.put('grid_base.html', "<div class=\"go-grid-table\">" + "<div class=\"go-grid-filters form-inline\" ng-if=\"viewParams.filtersVisible\" filters-container>" + "</div>" + "<div class=\"go-grid-table-header\">" + "<table>" + "<thead>" + "<th column-header ng-repeat=\"column in columns\" column=\"column\" ng-if=\"column.visible\"></th>" + "<th style=\"width: 100%; min-width: 50px\"></th>" + "</thead>" + "</table>" + "</div>" + "<div class=\"go-grid-table-body\" scroll-table>" + "<div>" + "<table>" + "<tbody>" + "<tr ng-repeat=\"item in truncated track by $index\" ng-class=\"{active: item.active, selected: item.selected, highlighted: item == highlighted}\" ng-click=\"highlight(item)\">" + "<td ng-repeat=\"column in columns\" go-cell ng-if=\"column.visible\"></td>" + "<td style=\"width: 100%\"></td>" + "</tr>" + "</tbody>" + "</table>" + "</div>" + "</div>" + "</div>" + "\n");
    }
  ]).directive('watchCount', function() {
    return {
      restrict: 'A',
      link: function(scope, element, opts) {
        var getScopes, watchCount;
        getScopes = function(element, scopes) {
          var child, e, _i, _len, _ref;
          e = angular.element(element);
          scopes[e.scope().$id] = e.scope();
          _ref = e.children();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            getScopes(child, scopes);
          }
          return scopes;
        };
        watchCount = function(scopes) {
          var c, id;
          c = 0;
          for (id in scopes) {
            scope = scopes[id];
            if (scope.$$watchers) {
              c += scope.$$watchers.length;
            }
          }
          return c;
        };
        return $(element).click(function() {
          var count;
          count = watchCount(getScopes('body', {}));
          return $(element).html("Count: " + count);
        });
      }
    };
  });

}).call(this);
