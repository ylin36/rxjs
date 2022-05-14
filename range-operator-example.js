var Rx=require('rx');
Rx.Observable.range(1, 3).subscribe(s => console.log(s), s => console.log('error' + s), s => console.log("completed"));