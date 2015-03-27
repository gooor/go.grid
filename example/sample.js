angular.module('sampleApp', ['goGrid','angularLocalStorage'])
  .controller('SampleController', ['$scope', function($scope) {
    //        angular.module('go.grid').locale = 'pl'
    // $scope.select = function(item) {
    //   for (var i = 0; i < $scope.items.length; i++) {
    //     delete $scope.items[i].active
    //     if ($scope.items[i] === item) {
    //       item.active = true
    //     }
    //   }
    // }
    //
    // $scope.refresh = function() {
    //   console.log(3223);
    // }
    $scope.items = [];
    var string = 'Ut a ipsum in justo varius pulvinar vitae non orci. Donec luctus ipsum eget ante dictum, sit amet tempus dolor tempus. Nunc eu condimentum elit. Sed placerat, nisl eget lacinia commodo, enim massa congue sem, non fringilla lorem tellus euismod nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut erat aliquam, efficitur urna sed, volutpat libero. Mauris non eleifend ex. Vivamus condimentum leo augue, eu finibus ligula luctus vel. Phasellus a odio non purus vehicula laoreet et in dui. Ut maximus venenatis neque eu venenatis. In blandit tellus et orci pharetra, eu tincidunt dolor pellentesque. Cras in elit ut nibh egestas dictum eget eget dui. Nullam porttitor, tellus eu bibendum sodales, nulla ante semper mi, quis molestie nunc augue sed quam. Pellentesque leo nisi, laoreet ac tortor in, sagittis molestie eros. Morbi velit augue, posuere quis neque vitae, condimentum consequat magna.'.split(' ');

    var l = string.length - 1;

    for (var i = 1; i <= 10000; i++) {

      i1 = Math.round(Math.random() * l)
      i2 = Math.round(Math.random() * l)
      i3 = Math.round(Math.random() * l)
      i4 = Math.round(Math.random() * l)
      i5 = Math.round(Math.random() * l)
      i6 = Math.round(Math.random() * l)
      i7 = Math.round(Math.random() * l)
      i8 = Math.round(Math.random() * l)
      i9 = Math.round(Math.random() * 100000) / 100
      $scope.items.push({
        id: i,
        field1: string[i1],
        field2: string[i2],
        field3: string[i3],
        field4: string[i4],
        field5: string[i5],
        field6: string[i6],
        field7: string[i7],
        field9: i9,
        //                toString: function () {
        //                    if ($scope.items.sortBy && this[$scope.items.sortBy]) {
        //                        if ($.isNumeric(this[$scope.items.sortBy])) {
        //                            ('0000000000000000000000000' + this[$scope.items.sortBy]).slice(-24)
        //                        } else {
        //                            this[$scope.items.sortBy].toLowerCase() //.removeAccents(1)
        //                        }
        //
        //                    } else {
        //                        ''
        //                    }
        //                }
      })


    }
    $scope.items.$resolved = true

  }]);
