const makeObservable = observableFn => ({
    subscribe: (onNext, onError, onComplete) => {
      return observableFn({
        next: onNext,
        error: onError,
        complete: onComplete
      });
    }
  }
);

const simplestObservable = subscriber => {
  subscriber.next(1);
  subscriber.complete();
};

const homeMadeObservable = makeObservable(simplestObservable);

homeMadeObservable.subscribe(
  e => console.log(`${name} Event`, e),
  err => console.error(`${name} Error:`, err),
  () => console.log(`${name} Completed`)
);