# promise-demo

This repository features two example promise implementations, for demo purposes only.

## Example Promise implementations

The first implementation (`sync-promise`) is the simplest. It is a synchronous implementation truly for demo use only and does not work for asynchronous events.

The second implementation (`async-promise`) is an asynchronous version that uses microtasks. This version follows mimics more closely (but not fully) the native `Promise` implementation, as specified in the [Promises/A+](https://promisesaplus.com/) standard.

`Promise` implementations in folder `promises`:

| File             | Description                            |
| ---------------- | -------------------------------------- |
| sync-promise.js  | Synchronous Promise implementation.    |
| async-promise.js | Asynchronous `Promise` implementation. |

## Example Promise consumers

Example `Promise` consumers in root folder:

| File             | Description                                |
| ---------------- | ------------------------------------------ |
| 1-sync-chain.js  | Consumes a `SyncPromise` in a chain.       |
| 2-async-chain.js | Consumes `AsyncPromise` in a chain.        |
| 3-await.js       | Consumes a promise using `async/await`.    |
| 4-all-chain.js   | Example: `Promise.all().then(...).catch()` |
| 5-all-await.js   | Example: `await Promise.all()`             |

### 1-sync-chain.js

```text
node 1-sync-chain <number>
```

With `<number>`:

1. Consume an immediately resolved `SyncPromise` in a chain.
2. Consume an immediately rejected `SyncPromise` in a chain.

### 2-async-chain.js

```text
node 2-async-chain <number>
```

With `<number>`:

1. Consume an immediately resolved promise in a chain.
2. Consume an immediately rejected promise in a chain.
3. Consume an asynchronously resolved promise in a chain.
4. Consume an asynchronously rejected promise in a chain.

### 3-await.js

```text
node 3-await <number>
```

With `<number>`:

1. Consume an asynchronously resolved promise using `await`.
2. Consume an asynchronously rejected promise using `await`.

### 4-all-chain.js

```text
node 4-all-chain <number>
```

Using:

```js
Promise.all()
  .then(...)
  .catch(...)
```

With `<number>`:

1. Consume an array of asynchronously resolved promises.
2. Consume an array of asynchronously rejected promises.

### 5-all-await.js

```text
node 4-all-await <number>
```

Using:

```js
try {
  const results = awaitPromise.all();
  ...
} catch(err) {
  ...
}
```

With `<number>`:

1. Consume an array of asynchronously resolved promises.
2. Consume an array of asynchronously rejected promises.
