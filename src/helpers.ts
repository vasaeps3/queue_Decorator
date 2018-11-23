export function getTime() {
  const date = new Date();
  return `${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
}