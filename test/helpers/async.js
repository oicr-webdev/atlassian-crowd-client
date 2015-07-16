export function assertAsync(promise, assert) {
  return new Promise((resolve, reject) => {
    promise.then((res) => {
      try {
        resolve(assert(res));
      } catch (e) {
        reject(e);
      }
    }, (e) => {
      reject(e);
    });
  });
}
