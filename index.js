import { timer } from 'rxjs';

const timerBox = document.getElementById("timer-box");
const updateTimerBox = number => timerBox.innerHTML = `${number}s`;

timer(0, 1000).subscribe(updateTimerBox);
