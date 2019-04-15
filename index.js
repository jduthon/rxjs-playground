import {
  fromEvent,
  from,
  combineLatest,
  animationFrameScheduler,
  interval,
  never,
  NEVER,
  range
} from 'rxjs';
import {
  scan,
  filter,
  switchMap,
  tap,
  takeUntil,
  observeOn,
  map,
  bufferCount,
  delay,
  startWith,
  throttleTime,
  finalize
} from 'rxjs/operators';

const mousePositionUI = document.getElementById('mouse-position');
const stateUI = document.getElementById('state');

const buttonClick$ = fromEvent(document.getElementById('button'), 'click');
const mouseMove$ = fromEvent(document, 'mousemove');

const mouseMoveX$ = mouseMove$.pipe(map(({ clientX }) => clientX));
const mouseMoveY$ = mouseMove$.pipe(map(({ clientY }) => clientY));

const backgroundColor = {
  hue: 100,
  saturation: 50,
  luminosity: 50
};

const updateBackgroundColor = element => ({ hue, saturation, luminosity }) => {
  element.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${luminosity}%)`;
};

const currentAndMax = scan(
  ({ max }, current) => ({ max: current > max ? current : max, current }),
  { max: 0 }
);

const normalize = (inRange, outRange) => value => {
  const inputMax = inRange[1] - inRange[0];
  const outputMax = outRange[1] - outRange[0];
  return Math.min(value / inputMax, 1) * outputMax + outRange[0];
};

const normalizeCurrentAndMax = outRange => ({ current, max }) =>
  normalize([0, max], outRange)(current);

const luminosityRange = [0, 100];
const hueRange = [0, 360];

const normalizeCurrentAndMaxLuminosity = normalizeCurrentAndMax(
  luminosityRange
);
const normalizeCurrentAndMaxHue = normalizeCurrentAndMax(hueRange);

const backgroundLuminosity$ = mouseMoveX$
  .pipe(currentAndMax)
  .pipe(map(normalizeCurrentAndMaxLuminosity));

const backgroundHue$ = mouseMoveY$
  .pipe(currentAndMax)
  .pipe(map(normalizeCurrentAndMaxHue));

combineLatest(backgroundLuminosity$, backgroundHue$)
  .pipe(observeOn(animationFrameScheduler))
  .pipe(map(([luminosity, hue]) => ({ ...backgroundColor, luminosity, hue })))
  .subscribe(updateBackgroundColor(document.body));

// Trace behind your mouse

const mouseClick$ = fromEvent(document, 'click');

const calculateVelocity = (prev, current) =>
  Math.abs(current.position - prev.position) / (current.time - prev.time);

const velocity = obs =>
  obs
    .pipe(map(position => ({ position, time: Date.now() })))
    .pipe(bufferCount(2))
    .pipe(filter(([prev, current]) => prev.time !== current.time))
    .pipe(tap(console.log))
    .pipe(map(([prev, current]) => calculateVelocity(prev, current)));

const mouseMoveVelocity$ = mouseMoveX$.pipe(velocity);

const generateRandomMaxNumber = max => Math.ceil(Math.random() * max);
const generateRandomColor = () =>
  `rgb(${new Array(3)
    .fill(0)
    .map(() => generateRandomMaxNumber(256))
    .join(',')})`;

const traceColor$ = mouseClick$
  .pipe(startWith(null))
  .pipe(map(generateRandomColor));

const createTrace = ({ x, y, size, color }) => {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = y;
  div.style.left = x;
  div.style.height = size;
  div.style.width = size;
  div.style.backgroundColor = color;
  div.style.borderRadius = '50%';
  document.body.appendChild(div);
  return div;
};

const reduceTraceSize = (trace, newSize) => {
  trace.style.height = newSize;
  trace.style.width = newSize;
};

const killTrace = trace => {
  document.body.removeChild(trace);
};

const createDecayingTrace = ({ x, y, velocity, color }) => {
  const originalSize = Math.random() * 40 + 5;
  const trace = createTrace({ x, y, size: originalSize, color });
  const decay = 1 - 1 / Math.max(velocity, 1.1);
  const decay$ = interval(500)
    .pipe(observeOn(animationFrameScheduler))
    .pipe(scan(latestValue => latestValue * decay, originalSize));
  return decay$
    .pipe(takeUntil(decay$.pipe(filter(v => v <= 1))))
    .pipe(finalize(() => killTrace(trace)))
    .subscribe(decayedSize => reduceTraceSize(trace, decayedSize));
};

combineLatest(mouseMove$, mouseMoveVelocity$, traceColor$)
  .pipe(observeOn(animationFrameScheduler))
  .subscribe(([{ clientX, clientY }, velocity, color]) =>
    createDecayingTrace({ x: clientX, y: clientY, velocity, color })
  );
