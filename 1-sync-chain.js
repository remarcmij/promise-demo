import { SyncPromise as Promise } from './promises/sync-promise.js';

function main(option) {
  console.log('<<< main starting >>>');

  const p = new Promise((resolve, reject) => {
    if (option === 1) {
      resolve();
    } else if (option === 2) {
      reject();
    }
  });

  p.then(() => {
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
