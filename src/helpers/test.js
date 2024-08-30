// helper testing methods

// alias for console.assert
const assert = (...args) => { console.assert(...args) }

// custom assert to check if expression returns error
const assertError = (error, ...args) => {
  let err, errMsg; 
  try {
    args[0].call();
  } catch (caughtError) {
    err = caughtError;
    errMsg = `${args[1] !== undefined ? args[1] + ' and ' : '' }`
                    + `expected error was ${error.name}, but got ${err.name}`;
  } finally {
    console.assert(err instanceof error, errMsg ? errMsg : args[1]);
  }
}

export { assert, assertError };