import { SyncPromise as Promise } from './promises/sync-promise.js';

function createPromise(number) {
  return new Promise((resolve, reject) => {
    if (number === 1) {
      resolve();
    } else if (number === 2) {
      reject();
    } else if (number === 3) {
      setTimeout(resolve, 2000);
    } else if (number === 4) {
      setTimeout(reject, 2000);
    }
  });
}

function main(number) {
  console.log('<<< main starting >>>');

  createPromise(number)
    .then(() => {
      console.log('>> then#1');
    })
    .then(() => {
      console.log('>> then#2');
    })
    .catch(() => {
      console.log('>> catch#3');
    })
    .catch(() => {
      console.log('>> catch#4');
    })
    .then(() => {
      console.log('>> then#5');
    });

  console.log('<<< main ending >>>');
}

main(+process.argv[2]);
