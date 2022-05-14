var Rx = require('rx');
var logValue = function(val) { console.log(val) };
var src = Rx.Observable.range(1, 5);
var sum = src.reduce(function(acc, x) 
{
  return acc + x;
});
sum.subscribe(logValue);