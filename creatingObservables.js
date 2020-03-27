import { Observable } from 'rxjs';

const simplestObservable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.complete();
});

const eventObservable = (target, eventName) => new Observable(subscriber => {
  const eventListenerCallback = e => subscriber.next(e);

  target.addEventListener(eventName, eventListenerCallback);
  return () => {
    target.removeEventListener(eventName, eventListenerCallback);
  }
});

const promiseObservable = promiseFn => new Observable(subscriber => {
  let disposed = false;
  promiseFn().then(promiseValue => {
    if (!disposed) {
      subscriber.next(promiseValue);
      subscriber.complete();
    }
  }, error => {
    if (!disposed) {
      subscriber.error(error);
    }
  });
  return () => {
    disposed = true;
  }
});

const intervalObservable = interval => new Observable(subscriber => {
  const intervalId = setInterval(() => subscriber.next(), interval);
  return () => clearInterval(intervalId);
});

const subscribeWithConsoles = (observable, name) => observable.subscribe(
  e => console.log(`${name} Event`, e),
  err => console.error(`${name} Error:`, err),
  () => console.log(`${name} Completed`)
);

subscribeWithConsoles(simplestObservable, 'simplest');

subscribeWithConsoles(eventObservable(window, 'resize'), 'resizeEventObservable');

subscribeWithConsoles(promiseObservable(() => Promise.resolve(1)), 'successfulPromiseObs')

subscribeWithConsoles(promiseObservable(() => Promise.reject('Error')), 'rejectPromiseObs');

subscribeWithConsoles(intervalObservable(1000), 'intervalObservable');

