'use strict';

angular.module('playground', [])
    .directive('pgCalendar', function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            transclude: true,
            scope: {
                highlight: '=',
                disable: '='                
            },
            template: "<div ng-transclude=''></div>" +
                "<div class='calendar'>" +
                "<div class='months-header'>" +
                "<div ng-repeat='month in months track by $index' ng-class='{selected: currentMonth == $index}' ng-click='selectMonth($index)' class='month'>{{month | limitTo:3}}</div>" +
                "</div>" +
                "<div class='days-header'>" +
                "<div ng-repeat='day in days track by $index' class='day'>{{day | limitTo:3}}</div>" +
                "</div>" +
                "<div class='days'>" +
                "<div ng-repeat='week in weeks track by $index' class='week'>" +
                "<div ng-repeat='day in week track by $index' ng-class='{selected: day.selected, highlight: day.highlight, disable: day.disable}' ng-click='selectDate(day)' class='day'>{{day.date}}</div>" +
                "</div>" +
                "</div>" +
                "</div>",
            link: function (scope, elem, attrs, ngModel) {
                scope.selectedDay = null;

                scope.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                              'Thursday', 'Friday', 'Saturday'];
                scope.months = ['January', 'February', 'March', 'April',
                                'May', 'June', 'July', 'August',
                                'September', 'October', 'November', 'December'];

                scope.startDay = attrs.startDay || 0;
                scope.highlightEdited = [];
                scope.disableEdited = [];

                if (scope.highlight)
                    scope.highlightEdited =
                    scope.highlight.map(function (h) {
                        return {
                            year: h.getFullYear(),
                            month: h.getMonth(),
                            date: h.getDate()
                        }
                    });

                if (scope.disable)
                    scope.disableEdited =
                    scope.disable.map(function (h) {
                        return {
                            year: h.getFullYear(),
                            month: h.getMonth(),
                            date: h.getDate()
                        }
                    });

                for (var j = 0; j < scope.startDay; j++) {
                    var current = scope.days;
                    current = current.push(current.shift());
                }

                scope.init = function (date) {
                    date.setHours(0,0,0,0);
                    var dateTime = date.getTime();
                    
                    scope.currentYear = date.getFullYear();
                    scope.currentMonth = date.getMonth();
                    scope.currentDate = date.getDate();

                    scope.firstDayOfMonth = new Date(scope.currentYear, scope.currentMonth, 1).getDay();
                    scope.daysInMonth = new Date(scope.currentYear, scope.currentMonth + 1, 0).getDate();

                    var days = [];
                    for (var i = 1 - (scope.startDay > 0 ? (7 - scope.startDay) : scope.startDay) - scope.firstDayOfMonth; i <= scope.daysInMonth; i++) {
                        var day = {};
                        day.date = i > 0 ? i : '';

                        if (i > 0) {
                            day.value = new Date(scope.currentYear, scope.currentMonth, i);
                            day.highlight =
                                scope.highlightEdited.some(function (h) {
                                    return h.date == i && h.month == scope.currentMonth && h.year == scope.currentYear;
                                });
                            day.disable =
                                scope.disableEdited.some(function (h) {
                                    return h.date == i && h.month == scope.currentMonth && h.year == scope.currentYear;
                                });
                            day.selected = day.value.getTime() == dateTime;
                            

                            if (day.selected)
                                scope.selectedDay = day;
                        }

                        days.push(day);
                    }

                    if (days[0].date == '' && days[1].date == '' && days[2].date == '' && days[3].date == '' && days[4].date == '' && days[5].date == '' && days[6].date == '') {
                        days.splice(0, 7);
                    }

                    scope.weeks = [].concat.apply([], days.map(function (elem, i) {
                        return i % 7 ? [] : [days.slice(i, i + 7)];
                    }));

                    scope.selectDate(scope.selectedDay);
                };

                /* events */
                scope.selectMonth = function (_month) {
                    scope.init(new Date(scope.currentYear, _month, 1));
                }

                scope.selectDate = function (_day) {
                    if (!_day.disable) {
                        scope.date = _day;

                        angular.forEach(scope.weeks, function (w) {
                            angular.forEach(w, function (d) {
                                d.selected = false;
                            })
                        });
                        _day.selected = true;                       

                        if (ngModel) {
                            ngModel.$setViewValue(_day.value);
                        }
                    }
                }

                if (ngModel)
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (newValue) {
                        if (scope.selectedDay == null || scope.selectedDay.value != newValue) {
                            scope.init(newValue);
                        }
                    });
                else
                    scope.init(new Date());

            }
        };
    });