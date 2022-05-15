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
var observer = Rx.Observer.create(
function onNext(x) 
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

## 8. Concurrency
### 8.1 Observable pipeline
Simple example. basically chaining up observables.

self contained. all state flow from one to next without needing external variables.
```
const Rx = require('rx');
Rx.Observable.from([1, 2, 3, 4, 5, 6, 7, 8])
  .filter(function(val) {
    return val % 2;
  })
  .map(function(val) {
    return val * 10;
  });
```
### 8.2 Pure functions
used to keep observable pipeline not needing external variables.

pure functions always returns same output given the same input. this guarantees functions don't modify state other functions rely on

### 8.3 Avoid external state
example of relying on external state
```
const Rx = require('rx');
var evenTicks = 0;
function updateDistance(i) 
{ 
  if (i % 2 === 0) 
  {
    evenTicks += 1;
  }
  return evenTicks; 
}
var ticksObservable = Rx.Observable 
                      .interval(1000) 
                      .map(updateDistance)
ticksObservable.subscribe(function() 
{
  console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});

Subscriber 1 - evenTicks: 1 so far
Subscriber 1 - evenTicks: 1 so far
Subscriber 1 - evenTicks: 2 so far
Subscriber 1 - evenTicks: 2 so far
```
wrong way. 

Observable pipeline will run **once for each subscriber**, increasing evenTicks twice.
```
const Rx = require('rx');
var evenTicks = 0;
function updateDistance(i) { if (i % 2 === 0) {
       evenTicks += 1;
     }
return evenTicks; }
var ticksObservable = Rx.Observable .interval(1000) .map(updateDistance)
ticksObservable.subscribe(function() {
console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});
ticksObservable.subscribe(function() {
console.log('Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});

Subscriber 1 - evenTicks: 1 so far
Subscriber 2 - evenTicks: 2 so far
Subscriber 1 - evenTicks: 2 so far
Subscriber 2 - evenTicks: 2 so far 
Subscriber 1 - evenTicks: 3 so far
Subscriber 2 - evenTicks: 4 so far
Subscriber 1 - evenTicks: 4 so far
Subscriber 2 - evenTicks: 4 so far

```
observable way to avoid state.

Using scan, we avoid external state altogether. pass the accumulated count of even ticks to updateDistance, instead of relying on an external variable
```
const Rx = require('rx');
function updateDistance(acc, i) 
{ 
  if (i % 2 === 0) 
  {
    acc += 1; 
  }
  return acc; 
}
var ticksObservable = Rx.Observable 
                      .interval(1000) 
                      .scan(updateDistance, 0);
ticksObservable.subscribe(function(evenTicks) 
{ 
  console.log('Subscriber 1 - evenTicks: ' + evenTicks + ' so far');
});
ticksObservable.subscribe(function(evenTicks) 
{ 
  console.log('Subscriber 2 - evenTicks: ' + evenTicks + ' so far');
});

Subscriber 1 - evenTicks: 1 so far
Subscriber 2 - evenTicks: 1 so far
Subscriber 1 - evenTicks: 1 so far
Subscriber 2 - evenTicks: 1 so far
Subscriber 1 - evenTicks: 2 so far
Subscriber 2 - evenTicks: 2 so far
Subscriber 1 - evenTicks: 2 so far 
Subscriber 2 - evenTicks: 2 so far
```

### 8.4 Chaining in pipeline [observable chains operate each item only once]
it may look the same in array and observables, but

* in array chaining, methods create a new array as a result of each operation, which is traversed entirely by next operation
```
stringArray // represents an array of 1,000 strings 
.map(function(str) 
{
    return str.toUpperCase();
})
.filter(function(str) 
{
    return /^[A-Z]+$/.test(str); 
})
.forEach(function(str) 
{ 
    console.log(str);
});

Line 3: We iterate through the array and create a new array with all the items in uppercase.

Line 5: We iterate through the uppercase array, creating another array with 1,000 elements.

Line 7: We iterate through the filtered array and log each result to the console.
```

* in observables, don't create intermediate observables and apply all operations to each elements in one go. The observable is traversed only once => chaining observable is more efficient. nothing happens until something subscribe to it. With Observables, we’ll go through our list only once, and we’ll apply the transformations only if absolutely

```
stringObservable // represents an observable emitting 1,000 strings
.map(function(str) 
{
    return str.toUpperCase();
})
.filter(function(str) 
{
    return /^[A-Z]+$/.test(str); 
})
.subscribe(function(str) 
{ 
    console.log(str);
});

Line 3: We create an uppercase function that will be applied to each item of the Observable and return an Observable that will emit these new items, whenever an Observer subscribes to it.

Line 5: We compose a filter function with the previous uppercase function, and return an Observable that will emit the new items, uppercased and filtered, but only when an Observable is subscribed to it.

Line 7: We trigger the Observable to emit items, going through all of them only once and applying the transformations we defined once per item.
```
The take operator makes the Observable emit only the first n items we specify. In our case, n is five, so out of the thousand strings, we’ll receive only the first five. The cool part is that our code will never traverse all the items. It will only apply our transformations to the first five.
```
stringObservable 
.map(function(str) 
{
  return str.toUpperCase(); 
})
.filter(function(str) 
{
  return /^[A-Z]+$/.test(str);
})
.take(5) 
.subscribe(function(str) 
{
  console.log(str);
});
```

### 8.5 Pipe

pipe can be used to organize instead of chaining
```
// observable of values from a text box, pipe chains operators together
inputValue
  .pipe(
    // wait for a 200ms pause
    debounceTime(200),
    // if the value is the same, ignore
    distinctUntilChanged(),
    // if an updated value comes through while request is still active cancel previous request and 'switch' to new observable
    switchMap(searchTerm => typeaheadApi.search(searchTerm))
  )
  // create a subscription
  .subscribe(results => {
    // update the dom
  });
```

## 9. RxJs Subject class
special type of observable that implements observable and observer types

The Subject class provides the base for creating more specialized Subjects. In fact, RxJS comes with some interesting ones: AsyncSubject, ReplaySubject, and BehaviorSubject.

```
const Rx = require('rx');
var subject = new Rx.Subject();
var source = Rx.Observable.interval(300)
.map(function(v) 
{ 
   return 'Interval message #' + v; 
}) 
.take(5);
source.subscribe(subject);
var subscription = subject.subscribe(
function onNext(x) 
{ 
   console.log('onNext: ' + x); 
},
function onError(e) 
{ 
   console.log('onError: ' + e.message); 
}, 
function onCompleted() 
{ 
   console.log('onCompleted'); 
});
subject.onNext('Our message #1');
subject.onNext('Our message #2');
setTimeout(function() 
{ 
   subject.onCompleted();
}, 1000);

onNext: Our message #1
onNext: Our message #2
onNext: Interval message #0
onNext: Interval message #1
onNext: Interval message #2
onCompleted

The values from the Observable come later because they are asynchronous, whereas we make the Subject’s own values immediate. 

Notice that even if we tell the source Observable to take the first five values, the output shows only the first three values, because subject.onComplete got called at 1000ms interval.

This finishes the notifications for all subscriptions and overrides the take operator in this case.
```

### 9.1 AsyncSubject
emits the last value of a sequence only if the sequence is complete. This value is then cached forever, and any Observer that subscribes after the value has been emitted will receive it right away. 

convenient for asynchronous operations that return a single value, such as Ajax requests.
```
const Rx = require('rx');
var delayedRange = Rx.Observable.range(0, 5).delay(1000);
var subject = new Rx.AsyncSubject();
delayedRange.subscribe(subject);
subject.subscribe(
  function onNext(item) {
    console.log('Value:', item);
  },
  function onError(err) {
    console.log('Error:', err);
  },
  function onCompleted() {
    console.log('Completed.');
  }
);

```

ajax example.

We can use AsyncSubject whenever we expect a single result and want to hold onto it.
```
const Rx = require('rx');
function getProducts(url) 
{ 
  var subject;
  return Rx.Observable.create(
    function(observer) 
    {
      if (!subject) 
      {
        subject = new Rx.AsyncSubject(); 
        Rx.DOM.get(url).subscribe(subject);
      }
      return subject.subscribe(observer); 
    });
}
var products = getProducts('/products');
// Will trigger request and receive the response when read products.subscribe(
function onNext(result) 
{ 
  console.log('Result 1:', result.response); 
}
function onError(error) 
{ 
  console.log('ERROR', error); 
};
// Will receive the result immediately because it's cached
setTimeout(function() 
{ 
  products.subscribe(
  function onNext(result) 
  { 
    console.log('Result 2:', result.response); 
  },
  function onError(error) 
  { 
    console.log('ERROR', error); 
  } );
}, 5000);
```

### 9.2 BehaviorSubject
Observer subscribes to a BehaviorSubject, it receives the last emitted value and then all the subsequent values. 

BehaviorSubject requires a starting value so that all Observers always receive a value when they subscribe to a BehaviorSubject.

Suppose that we want to retrieve a remote file and print its contents on an HTML page, but we want to display some placeholder text while we wait for the contents. We can use a BehaviorSubject for this

A BehaviorSubject guarantees that there will always be at least one value emitted because we provide a default value in its constructor. Once the BehaviorSubject completes, it won’t emit any more values, freeing the memory used by the cached value.
```
const Rx = require('rx');
var subject = new Rx.BehaviorSubject('Waiting for content');
subject.subscribe( 
  function(result) 
  {
    document.body.textContent = result.response || result;
  },
  function(err) 
  {
    document.body.textContent = 'There was an error retrieving content';
  } );
Rx.DOM.get('/remote/content').subscribe(subject);
```

### 9.3 ReplaySubject
A ReplaySubject caches its values and re-emits them to any Observer that subscribes to it late. Unlike with an AsyncSubject, the sequence doesn’t need to be completed for this to happen.

```
var Rx=require('rx');
var subject = new Rx.ReplaySubject();
subject.onNext(1);
subject.subscribe(
    function(n) 
    { 
        console.log('Received value:', n);
    });
subject.onNext(2);
subject.onNext(3);

Received value: 1
Received value: 2
Received value: 3
```

to accomplish this behaviour, the ReplaySubject caches all the values in memory. To prevent it from using too much memory, we can limit the amount of data it stores by buffer size, window of time, or by passing particular parameters to the constructor.

```
const Rx = require('rx');
var subject = new Rx.ReplaySubject(2); // Buffer size of 2
   subject.onNext(1);
   subject.onNext(2);
   subject.onNext(3);
subject.subscribe(
   function(n) 
   { 
      console.log('Received value:', n);
   });

Received value: 2
Received value: 3
```
The second parameter takes a number that represents the time, in milliseconds, during which we want to buffer values:
```
const Rx = require('rx');
var subject = new Rx.ReplaySubject(null, 200); // Buffer size of 200ms
setTimeout(
function() 
{ 
  subject.onNext(1); 
}, 100); 
setTimeout(
function() 
{ 
  subject.onNext(2); 
}, 200); 
setTimeout(
function() 
{ 
  subject.onNext(3); 
}, 300); 
setTimeout(
function() 
{
  subject.subscribe(
    function(n) 
    { 
      console.log('Received value:', n);
    });
  subject.onNext(4);
}, 350);

Received value: 2
Received value: 3
Received value: 4
```

## 10. Hot vs Cold observable
### 10.1 Hot Observable

hot Observable will receive the values that are emitted from the exact moment it subscribes to it. Every other Observer subscribed at that moment will receive the exact same values. This is similar to how JavaScript events work.
```
var onMove = Rx.Observable.fromEvent(document, 'mousemove');
var subscriber1 = onMove.subscribe(function(e) 
{
  console.log('Subscriber1:', e.clientX, e.clientY);
});
var subscriber2 = onMove.subscribe(function(e) 
{
  console.log('Subscriber2:', e.clientX, e.clientY);
});
```
### 10.2 Cold Observable
A cold Observable emits values only when the Observers subscribe to it.

For example, Rx.Observable.range returns a cold Observable. Every new Observer that subscribes to it will receive the whole range:

```
var Rx = require('rx');
function printValue(value) {
  console.log(value);
}
var rangeToFive = Rx.Observable.range(1, 5);
var obs1 = rangeToFive.subscribe(printValue); // 1, 2, 3, 4, 5
var obs2 = Rx.Observable
  .just() // Creates an empty Observable 
  .delay(2000)
  .flatMap(function() {
    return rangeToFive.subscribe(printValue); // 1, 2, 3, 4, 5 
  });
```

## 11. Schedulers

* ObserveOn

The observeOn operator takes a Scheduler and returns a new Observable which then uses that Scheduler. This makes every onNext call run in the new Scheduler.

* SubscribeOn

The subscribeOn operator forces the subscription and unsubscription work (not the notifications) of an Observable to run on a particular Scheduler. Like the observeOn operator, it accepts a Scheduler as a parameter. The subscribeOn operator is useful when, for example, we’re running in the browser and doing significant work in the subscribe call but we don’t want to block the UI thread with it.

### 11.1 Immediate scheduler
The immediate Scheduler emits notifications from the Observable synchronously, so whenever an action is scheduled on the immediate Scheduler, it will be executed right away, blocking the thread.

*Rx.Observable.range operator uses immediate scheduler internally* This means all subsequent also runs immediately.

The immediate Scheduler is well suited for Observables that execute predictable and inexpensive operations in each notification. The Observable eventually has to call the onCompleted function.
```
const Rx = require('rx');
console.log('Before subscription');
Rx.Observable.range(1, 5) 
.do(function(a) 
{
    console.log('Processing value', a); 
})
.map(function(value) 
{ 
    return value * value; 
}) 
.subscribe(function(value) 
{ 
    console.log('Emitted', value); 
});
console.log('After subscription');
```

### 11.2 Default scheduler
The default Scheduler runs actions asynchronously. it's rough equivalent of setTimeout with a zero-millisecond delay that keeps the order in the sequence. It uses the most efficient asynchronous implementation available on the platform it runs (for example, process.nextTick in Node.js or set-Timeout in the browser).

The default Scheduler never blocks the event loop, so it’s ideal for operations that involve time, such as asynchronous requests. It can also be used in Observables that are never complete because it doesn’t block the program while waiting for new notifications (which may never happen).
```
const Rx = require('rx');
console.log('Before subscription'); 
Rx.Observable.range(1, 5)
.do(function(value) 
{ 
    console.log('Processing value', value);
})
.observeOn(Rx.Scheduler.default)
.map(function(value) 
{ 
    return value * value; 
}) 
.subscribe(function(value) 
{ 
    console.log('Emitted', value); 
});
console.log('After subscription');
```

### 11.3 CurrentThread scheduler
The currentThread Scheduler is synchronous, just like the immediate Scheduler, but in case we use recursive operators, it enqueues the actions to execute instead of executing them right away.

A recursive operator is an operator that schedules another operator. A good example of a recursive operator is the repeat operator. The repeat operator—if given no parameters—keeps repeating the previous Observable sequence in the chain indefinitely.

We’ll get in trouble if we call the repeat operator on an operator that uses the immediate Scheduler, such as the return operator. Let’s try this by repeating the value 10 and then using the take operator to take only the first value of the repetition. Ideally, the code will print “10” once and then exit:

```
const Rx = require('rx');
Rx.Observable.return(10).repeat().take(1) 
.subscribe(function(value) 
{
  console.log(value);
});
```
scheduler current thread
```
const Rx = require('rx');
var scheduler = Rx.Scheduler.currentThread; 
Rx.Observable.return(10, scheduler).repeat().take(1)
.subscribe(function(value) 
{ 
    console.log(value);
});
```

### 11.4 Test Scheduler

RxJS gives us the TestScheduler, a Scheduler that is designed to help with testing. The TestScheduler allows us to emulate time at our convenience and create deterministic tests, where they are guaranteed to be 100% repeatable.

A TestScheduler is a specialization of a VirtualTimeScheduler. VirtualTimeSchedulers execute actions in “virtual” time, instead of in realtime. Scheduled actions go in a queue and are assigned a moment in virtual time. The Scheduler then runs the actions in order when its clock advances. Since it is virtual time, everything runs immediately, without having to wait for the time specified.
```
var Rx = require('rx');
var QUnit = require('qunit');
var onNext = Rx.ReactiveTest.onNext;
QUnit.test('Test value order', function (assert) {
  var scheduler = new Rx.TestScheduler();
  var subject = scheduler.createColdObservable(
    onNext(100, 'first'),
    onNext(200, 'second'),
    onNext(300, 'third')
  );
  var result = '';
  subject.subscribe(function (value) {
    result = value;
  });
  scheduler.advanceBy(100);
  assert.equal(result, 'first');
  scheduler.advanceBy(100);
  assert.equal(result, 'second');
  scheduler.advanceBy(100);
  assert.equal(result, 'third');
});

```