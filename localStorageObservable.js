import { Subject } from 'rxjs';

const makeLocalStorage = storageKey => ({
  get: () => localStorage.getItem(storageKey),
  set: item => localStorage.setItem(storageKey, item),
  remove: () => localStorage.removeItem(storageKey)
});

const catStorage = makeLocalStorage('cat');

catStorage.set('Natasha');

console.log(catStorage.get());

catStorage.set('Banana');

console.log(catStorage.get());

catStorage.remove();

console.log(catStorage.get());

// How do we now make this reactive?

const makeReactiveLocalStorage = storageKey => {
  const storageSubject = new Subject(); // PublishSubject in iOS/Android
  const storage = makeLocalStorage(storageKey);

  return {
    get: () => storage.get(),
    set: item => {
      storage.set(item);
      storageSubject.next(item);
    },
    remove: () => {
      storage.remove();
      storageSubject.next(null);
    },
    rx: storageSubject.asObservable()
  }
};

const reactiveCatStorage = makeReactiveLocalStorage('cat');

reactiveCatStorage.rx.subscribe(console.log);

reactiveCatStorage.set('Natasha');
reactiveCatStorage.set('Banana');
reactiveCatStorage.remove();