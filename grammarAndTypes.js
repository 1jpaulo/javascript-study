"use strict";
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

/* 
  Variable scope
  - Global scope
  - Module scope
  - Function scope
  - Block Scope (let and const)
 */

/* 
  Variable hoisting
  - var declared variables will be hoisted in their scope
    - variable initialization is not hoisted, only its declaration,
      so the value is undefined
  - all functions are hoisted in their scope
 */

// var hoisting
assert(x === undefined)
var x = 3;
assert(x === 3)

// const and let have no hoisting and will throw reference error
assertError(ReferenceError, () => z === undefined);
const z = 3;
assertError(ReferenceError, () => y === undefined, 'no let hoisting, y is undefined')
let y = 3;

// Constants

// const only prevents reassignments, mutations are still permitted.
// Array's contents can be changed and object properties as well.

const a = 1;
assertError(TypeError, () => { a = 2 });

// Constant mutations
const arr = [1, 2, 3];
arr.push(4)
assert(arr.length === 4 && arr[3] === 4)

const obj_ = { value: 1 };
obj_.value = 3;
assert(obj_.value === 3);

// Function declaration hoisting
assert(6 === sum(2, 1, 3));

function sum(...args) {
  return args.reduce((p, c) => p + c);
}

// function expressions don't work
assert(ReferenceError, () => { 6 === multiply(2, 1, 3) }, "function expressions won't be hoisted");
const multiply = (...args) => args.reduce((p, c) => p * c);

assert(ReferenceError, () => 1 === subtract(2, 1), "function expressions won't be hoisted");
const subtract = function(a, b) { a - b };

// Global variables

// can be defined using the globalThis object which represents the global scope

const defineGlobalScopeVariable = () => globalThis.t = () => "I'm global";
const tryToUseGlobalScopedVariable = () => t();

assertError(ReferenceError, () => undefined === t());

defineGlobalScopeVariable();
assert(t instanceof Function);
assert(t() === "I'm global");

/* 
  Datas structures and types

  7 scalar/primitive types
  - null (not really a primitve type, typeof null gives object)
  - boolean
  - number
  - bigint
  - undefined
  - string
  - symbol

  1 non-primitive type
  - object
 */

// dynamically typed language
let num = 2;
// used typeof for ease of use
assert(typeof num === 'number');
// could also use instanceof, but it needs to be wrapped since it represents a primitive value
// explanation here: https://stackoverflow.com/a/472427/17746367
assert(Object(num) instanceof Number);


// since Number and String are 
// won't give any errors
num = 'not really a number anymore';
assert(typeof num === 'string');
assert(Object(num) instanceof String);

/* 

  Casting with '+' operator

 */

// when numeric values are encountered with string values using a + operator
// the numeric value will be cast into string and the + will be a concatenation operator

// for numeric + string / string + numeric operations
assert(typeof (3 + 's') === 'string')
assert(3 + 's' === '3s')

// number + string casting is commutative
assert(typeof ('s' + 3) === 'string')
// the operation is not though
assert('s' + 3 === 's3')

// for other operations but +

// casted to number
assert(typeof (3 - '2') === 'number')
assert(3 - '2' === 1)

assert(typeof (3 * '2') === 'number')
assert(3 * '2' === 6)

// and so on for /, %, etc
// this is also true for numeric strings only as well
assert(typeof ('3' - '2') === 'number')
assert('3' - '2' === 1)

// Number parsing

// parsing can be done using parseInt and parseFloat or simply prefixing a + operator (unary plus operator)
assert(parseInt('2') === 2)
assert(parseFloat('2.2344') === 2.2344)

assert(+'2' === 2)
assert(+'2.2344' === 2.2344)

/* 

  Literals
    - They are a textual representation or notation of a constant/fixed value provided inline
    - Javascript has these types of literals:
      - Array
      - Object
      - String
      - RegExp
      - Boolean
      - Numeric
 */

/* 
  Array literals
  - List of zero or more expressions enclosed in [].
  - Each expression corresponds to an array element.
  - When initializing the length property will be set to he number of elements.
  - Whenever an array literal is evaluated an array object will be created, which means if a function or loop has an
    array definition with an array literal, it will create a new array object every time the line is executed.
  */

const normalEmptyArray = [];
assert(normalEmptyArray.length === 0);

const normalFilledArray = [1, 2];
assert(normalFilledArray.length === 2);

/* 
  [Better not used it though]
  Arrays can accept empty values in their definition by placing empty filled gaps between commas.
  The trailing gap between comma and close bracket is ignored.
  */

const emptyValueFilledArray = [1,,];
assert(emptyValueFilledArray.length === 2);

/* 
  This is different from undefined value, it will be skipped inside mapping functions
  */

const arrayCount = emptyValueFilledArray.map(_ => 1);
assert(arrayCount.reduce((p, c) => p + c) === 1);
// The length is still oddly two. WHY? Map is somehow creating an array object with length 2.
assert(arrayCount.length === 2);

// the value is still accesible and will have the same value as undefined (but differ in behavior like seen above)
// better to say undefined-like
assert(emptyValueFilledArray[1] === undefined);

/* 
  Boolean literals
  Accepts either true or false.
  */
const isZeroLength = (arr) => arr.length === 0;
assert(isZeroLength([]) === true);
assert(isZeroLength([,]) === false);

/* 
  Numeric literals
  There is two types of literals, integer and floating point.
  Integers have different bases and floating point numbers only base 10.

  Note: ES specification requires numeric to be unsiged.
  Values like -1.2 or -3 are interpreted like:
  (Unary operator minus)(numeric value)
                      -  1.2
  */