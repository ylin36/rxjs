const Rx = require('rx');
var delayedRange = Rx.Observable.range(0, 5).delay(1000);

// show what are all the ranges it prints
delayedRange.subscribe(s => console.log(s));

// demostrates async subject only emits when it completes and emits the last sequence
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


// returns immediate
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