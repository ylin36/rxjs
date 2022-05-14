## 0. installation

```
npm install rx
```

## 1. example usage
```
var Rx = require('rx');
Rx.Observable.just('Hello World!').subscribe(function(value) 
{ 
    console.log(value);
});
```

## 2. paradigm => observer + iterator = rx pattern
```
An Observable doesn’t start streaming items until it has at least one Observer subscribed to it.
Like Iterators, an Observable can signal when the sequence is completed.

concept is to keep states within rx observables, and not in external variables
```

## 3. create observable
create operator in the Rx.Observable object takes a callback that accepts an Observer as a parameter.
defines how the Observable will emit values.
```
var observable = Rx.Observable.create(function(observer) 
{ 
    observer.onNext('Simon');
    observer.onNext('Jen');
    observer.onNext('Sergi');
    observer.onCompleted(); // We are done 
});
```

## 4. create observer [long version and short version]
Observers listen to Observables. Whenever an event happens in an Observable, it calls the related method in all of its Observers.

### 4.1 long version
```
The observable will emit
1) onNext => same as update
2) onComplete => signals there are no more data. any further calls to onNext will have no effect
3) onError => signals error occured in observable. any further calls to onNext will have no effect
```
The create method in the Rx.Observer object takes the functions for the onNext, onCompleted, and onError cases and returns an Observer instance.
```
var observer = Rx.Observer.create(function onNext(x) 
{ 
    console.log('Next: ' + x); 
}, 
function onError(err) 
{ 
    console.log('Error: ' + err); 
}, 
function onCompleted() 
{ 
    console.log('Completed'); 
});
```
### 4.2 short version
```
// Subscribe an Observer to it. short version of 
test.subscribe(
    function onNext(x) { console.log('Result: ' + x); }, 
    function onError(err) { console.log('Error: ' + err); }, 
    function onCompleted() { console.log('Completed'); }
);
```

## 5. operators
methods that transform or query sequence are operators. static in Rx.Observable. for example: create.

simplified version for http get in ajaxtest-longsyntax.js
```
Rx.DOM.get('/api/contents.json').subscribe(
    function onNext(data) { console.log(data.response); }, 
    function onError(err) { console.error(err); }
);
```

### 5.1 operator: create observable from arrays
```
Rx.Observable.from(['Adrià', 'Jen', 'Sergi']).subscribe(function(x) 
{ 
    console.log('Next: ' + x); 
}, 
function(err) 
{ 
    console.log('Error:', err); 
}, 
function() 
{ 
    console.log('Completed'); 
});
```
### 5.2 operator: create observable from events
```
var allMoves = Rx.Observable.fromEvent(document, 'mousemove') 
allMoves.subscribe(function(e) 
{
  console.log(e.clientX, e.clientY);
});
```
can create more independent observables from event observable
```
var movesOnTheRight = allMoves.filter(function(e) 
{ 
    return e.clientX > window.innerWidth / 2;
});
var movesOnTheLeft = allMoves.filter(function(e) 
{ 
    return e.clientX < window.innerWidth / 2;
});
movesOnTheRight.subscribe(function(e) 
{ 
    console.log('Mouse is on the right:', e.clientX);
});
movesOnTheLeft.subscribe(function(e) 
{ 
    console.log('Mouse is on the left:', e.clientX);
});
```

### 5.3 operator: create observable from callback functions
```
var Rx = require('rx'); // Load RxJS
var fs = require('fs'); // Load Node.js Filesystem module
// Create an Observable from the readdir method
var readdir = Rx.Observable.fromNodeCallback(fs.readdir); // Send a delayed message
var source = readdir('/Users/sergi');
var subscription = source.subscribe
(
    function(res) 
    { 
        console.log('List of directories: ' + res); 
    },
    function(err) 
    { 
        console.log('Error: ' + err); 
    },
    function() 
    { 
        console.log('Done!'); 
    }
);
```

### 5.4 operator: range
emits observable within a specific range. onComplete is called when range ends
```
param1 => starting value
param2 => total count

var Rx=require('rx');
Rx.Observable.range(1, 3).subscribe(s => console.log(s), s => console.log('error' + s), s => console.log("completed"));

E:\git\rxjs>node range-operator-example.js
1
2
3
completed
```

### 5.4 operator: interval

```
var Rx=require('rx');
var a = Rx.Observable.interval(200).map(function(i) 
{ 
    return 'A' + i;
});
var b = Rx.Observable.interval(100).map(function(i) 
{
    return 'B' + i; 
});
```
### 5.4 operator: merge
takes 2 different observables above and return new one with merged values
```
Rx.Observable.merge(a, b).subscribe(function(x) 
{ 
    console.log(x);
});
```

### 5.4 operator: map (common to collection processing)
takes and observable and a function and applies that function to each value in source observable. return new observable with transformed value. 

```
var Rx=require('rx')
var logValue = function(val) { console.log(val) };
var src = Rx.Observable.range(1, 5); 
var upper = src.map(function(name) {
return name * 2; });
upper.subscribe(logValue);
```

### 5.5 operator: filter (common to collection processing)
take each observable and test each on condition in param function. only return sequences of elements that resulted in true
```
var Rx=require('rx')
var logValue = function(val) { console.log(val) };
var isEven = (function(val) { return val % 2 === 0; });
var src = Rx.Observable.range(1, 5); 
var even = src.filter(isEven);
even.subscribe(logValue);
```

### 5.6 operator: reduce aka fold (common to collection processing)
take an observable and return a new one that always contains a single item as a result of of applying a function over each element. => receives current element and result of the function's prev invocation
```
var Rx = require('rx');
var src = [1,2,3,4,5];
var sum = src.reduce(function(a,b)
{
  return a+b;
});
console.log(sum);
```

### 5.7 aggregate operators: avg, first, etc.. (can also be implemented with reduce)
process a seq and return a single value. eg. Rx.Observable.first(<observable>, <predicate>). RxObservable.average...

example of average implemented using reduce instead of Rx.Obserable.average
```
var Rx=require('rx');
var avg = Rx.Observable.range(0, 5) .reduce(function(prev, cur) 
{
  return {sum: prev.sum + cur, count: prev.count + 1};
  }, { sum: 0, count: 0 }) .map(function(o) 
  {
    return o.sum / o.count; 
  });
  var subscription = avg.subscribe(function(x) 
  { 
    console.log('Average is: ', x);
  });
```

### 5.8 aggregator operator: scan (like reduce, but produce intermediate results)
program that calc average walk speed as they walk. if user hasn't finished walking, we can only calc average with speed we know so far. we want to log average of an infinite sequence in real time.

scan operator is like reduce but emits each intermediate result
```
var Rx = require('rx');
var avg = Rx.Observable.interval(1000).scan(function (prev, cur) 
          {
            return {sum: prev.sum + cur, count: prev.count + 1};
          }, 
          { sum: 0, count: 0 }) 
          .map(function(o) 
          {
            return o.sum / o.count; });
            var subscription = avg.subscribe( function (x) 
            { 
              console.log(x);
            });
```

### 5.9 operator: flatMap
takes an observable A, who elements are also observables, and return an observable with the flatten values of A's child observables. 

it's like concatAll for observables

```
var Rx=require('rx');
const values$ = Rx.Observable.from([
  Rx.Observable.of(1, 2, 3),
  Rx.Observable.of(4, 5, 6),
  Rx.Observable.of(7, 8, 9)
]);

values$.concatAll().subscribe(v => console.log(v));
```

## 6. Canceling sequences
Advantage over other callback and promises. can be directly cancelled.

### 6.1 Explicit cancellation
when subscribed, the return value is a Disposable. Just call the dispose function.
```
var Rx=require('rx');
var counter = Rx.Observable.interval(1000);
var subscription1 = counter.subscribe(function(i) 
{ 
    console.log('Subscription 1:', i);
});
var subscription2 = counter.subscribe(function(i) 
{ 
    console.log('Subscription 2:', i);
});
setTimeout(function() { 
    console.log('Canceling subscription2!'); subscription2.dispose();
}, 2000);
```

### 6.2 Implicit cancel
most of the time, operators will automatically cancel subscriptions, such as range or take, will cancel subs when sequences finish or when operator conditions are met. 

advanced operators like withLatestFrom and flatMapLatest internally creates and destroys subs as needed. 

### 6.3 Canceling Observables that wrap external api
If we cancel the subscription to the Observable it effectively stops it from receiving the notification. However, the then method of the promise still runs, showing that canceling the Observable doesn’t cancel the underlying promise.

```
var Rx=require('rx');
var p = new Promise(function(resolve, reject) 
        { 
           setTimeout(resolve, 5000);
        });
p.then(function() 
{ 
   console.log('Potential side effect!');
});
var subscription = Rx.Observable.fromPromise(p)
.subscribe(function(msg) 
{ 
   console.log('Observable resolved!');
});
subscription.dispose();
```

## 7. Sequencing Errors
### 7.1 onError
Cannot use conventional try catch in callback because it's synchronous. It runs before any async code, so it won't catch errors. 

Use onError param. By default, when onError gets called, onComplete will not.
```
var Rx=require('rx');
function getJSON(arr) {
  return Rx.Observable.from(arr).map(function(str) {
  var parsedJSON = JSON.parse(str);
  return parsedJSON; });
  }
getJSON([
  '{"1": 1, "2": 2}',
  '{"success: true}', // Invalid JSON string 
  '{"enabled": true}'
  ]).subscribe( function(json) {
  console.log('Parsed JSON: ', json); },
  function(err) 
  { 
    console.log(err.message);
  } );
```

### 7.2 Catch operator
Allows us to react to error, and continue on.

catch operator takes either an Observable or a function, which receives the error as a param and return another observable.

catch will make it so it deals with errors and continue on executing. do not throw onError.

Eg. emit a json object containing the error property

```
var Rx=require('rx');
function getJSON(arr) 
{
  return Rx.Observable.from(arr).map(function(str) 
  {
     var parsedJSON = JSON.parse(str);
     return parsedJSON; 
  });
}
var caught = getJSON(['{"1": 1, "2": 2}', '{"1: 1}']).catch( Rx.Observable.return
({
     error: 'There was an error parsing JSON' 
}));
caught.subscribe( function(json) 
{
  console.log('Parsed JSON: ', json); 
},
// Because we catch errors now, `onError` will not be executed
function(e) 
{
  console.log('ERROR', e.message);
});
  
```

### 7.3 Retrying the sequence
sometimes error happens like timeouts. we can retry it.

retry behavior:

a) if no param is passed, it will retry infinite amount
b) retries the whole observable sequence again, even if some didn't error

```
// This will try to retrieve the remote URL up to 5 times.
Rx.DOM.get('/products').retry(5).subscribe
(
    function(xhr) 
    { 
        console.log(xhr); 
    },
    function(err) 
    { 
        console.error('ERROR: ', err); 
    } 
);
```