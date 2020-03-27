const makeObservable = (initialData) => {
  let data = initialData;
  let observers = [];

  return {
    get: () => ({ ...data }),
    set: newData => {
      data = { ...newData };
      observers.forEach(observer => observer({ ...newData }));
    },
    observe: callback => { observers = [...observers, callback]; },
    removeObserver: callback => { observers = observers.filter(observer => observer !== callback ); }
  }
};

const cat = {
  name: 'Natascha',
  age: 2,
  owner: 'Bob'
}

const catObservable = makeObservable(cat);


console.log(catObservable.get());

const firstObserver = cat => console.log('First observer', cat);
const secondObserver = cat => console.log('Second observer', cat);


catObservable.observe(firstObserver);
catObservable.observe(secondObserver);

catObservable.set({
  ...cat,
  owner: 'Patrick'
});

catObservable.removeObserver(firstObserver);

catObservable.set({
  ...cat,
  age: 3
});