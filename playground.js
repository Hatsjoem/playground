angular.module('playground', [])
    .directive('pgCalendar', function(){
        return{
            restrict: 'E',
            link: function(scope, elem, attrs){
                console.log("My first directive!");
            }
        };
    });