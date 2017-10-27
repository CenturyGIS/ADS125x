import Promise from 'bluebird';

export function timeDelay(delay) {
  return new Promise(resolve => setTimeout(() => resolve(), delay));
}
