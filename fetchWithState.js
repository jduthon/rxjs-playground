import { from } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

const STATUS = {
  initial: 'initial',
  loading: 'loading',
  done: 'done'
};

const makeFetchWithCache = (...fetchArguments) => {
  let answer;

  let hasCachedValue = () => !!answer;

  return {
    hasCachedValue,
    getValue: () => hasCachedValue() ? Promise.resolve(answer) : fetch(...fetchArguments).then(result => {
      answer = result;
      return answer;
    })
  }
};

const openTdbFetchWithCache = makeFetchWithCache('https://opentdb.com/api.php?amount=10');

const fetchWithState = fetchWithCache => from(fetchWithCache.getValue()).pipe(
    map(value => ({status: STATUS.done, value })),
    fetchWithCache.hasCachedValue() ? tap(() => {}) : startWith({ status: STATUS.loading }),
);

fetchWithState(openTdbFetchWithCache).pipe(tap(({ status }) => {
  if (status === STATUS.done) {
    fetchWithState(openTdbFetchWithCache).subscribe(console.log);
  }
})).subscribe(console.log);