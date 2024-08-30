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
  OBJECTS
  Objects are quite tricky and complex, here there is some behavior
  on how to deal with custom descriptors and their properties
*/

// define an object
const obj = {
  _value: 1
}

// set an accessor property as v
Object.defineProperty(obj, 'v', {
  get() { return this._value; },
  set(newValue) { this._value = newValue**3; }
});


assert(obj.v === 1);
obj.v = 3;
assert(obj.v === 27);
assertError(ReferenceError, () => _value = 3);

// set a dat property as d

// the code below won't work, it seems for data properties defineProperty's this has
// global scope (references globalThis)

// Object.defineProperty(obj, 'd', {
//   value: this.v * 2
// });

Object.defineProperty(obj, 'd', {
  value: obj.v * 2
});
assert(obj.d === 54);


/* 
  Definition:
    Accessor Descriptor and Data descriptor are slightly different.

    Defining a property we can set:
      - value
      - writable
      - enumerable
      - configurable
      - getter (with get keyword)
      - setter (with set keyword)
    
    Data descriptor: If a property is defined with value or writable, it cannot have get or set.
    Accessor descriptor: If a property is defined with get or set, it cannot have value or writable.

    Ps.: It is implicit that having getter and setter the writable state would be
      true, but you can create custom logic inside set function to not write to the
      variable and even throw errors like data property with writable: false also throws.

    - Writable
      - if true, value can be changed
      - if false, value cannot be changed after initialization and will be read-only (unless using defineProperty and 
        configurable: true is set)
      - If false value has to be set like: obj.prop = value
    - Configurable
      - Controls whether you can change other property's descriptor values (configurable, 
        writable, enumerable and value) and the object's property can be deleted
        (delete obj.property1)
      - P.s. other attributes of its descriptor cannot be changed (however, if it's a data descriptor with 
          writable: true, the value can be changed, and writable can be changed to false).
      - if true, property's descriptor can be changed and the property deleted
      - if false, property's descriptor cannot be changed and the property not deleted
    - Enumerable
      - Controls whether the property will be available in enumerations, like loops (for...in, forEach), 
        Object.keys and other loops.

    P.s. when setting a descriptor property the others will be false if not set. E.g setting writable and
      not the others, they will default to false.
 */

const obj_1 = { _value: 1};

// make it enumerable, so will be shown in loops and other enumerations
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, enumerable: true, writable: true, configurable: true });
assert(Object.keys(obj_1).includes('immutableProperty') && Object.keys(obj_1).length === 2)
// turn enumerable false
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, enumerable: false });
assert(!Object.keys(obj_1).includes('immutableProperty') && Object.keys(obj_1).length === 1)
// turn enumerable back to true
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, enumerable: true });
assert(Object.keys(obj_1).includes('immutableProperty') && Object.keys(obj_1).length === 2)

// turn writable to false
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, writable: false });
assertError(TypeError, () => obj_1.immutableProperty = 3);
assert(obj_1.immutableProperty === 300)

// reassignment through defineProperty still works if configurable: true is set
Object.defineProperty(obj_1, 'immutableProperty', { value: 10, writable: false });
assert(obj_1.immutableProperty === 10)

// turn writable back to true
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, writable: true });
obj_1.immutableProperty = 3;
assert(obj_1.immutableProperty === 3)

// with configurable true, you can also delete the property
Object.defineProperty(obj_1, 'dummy', { value: 10, enumerable: true, writable: true, configurable: true});
assert(Object.keys(obj_1).includes('dummy') && Object.keys(obj_1).length === 3)
delete obj_1.dummy;
assert(!Object.keys(obj_1).includes('dummy') && Object.keys(obj_1).length === 2)

// turn configurable to false
Object.defineProperty(obj_1, 'immutableProperty', { value: 300, configurable: false });

// setting by accessing the object's property with dot operator still works for reassignment
obj_1.immutableProperty = 3;
assert(obj_1.immutableProperty === 3)

// reassigning the value with defineProperty while configurable: false is set will only work with data descriptor
Object.defineProperty(obj_1, 'immutableProperty', { value: 10 });
assert(obj_1.immutableProperty === 10);

// reassigning writable from true to false is also possible while configurable is false for data descriptors only
Object.defineProperty(obj_1, 'immutableProperty', { writable: false });
// now the value is not changeable anymore
assertError(TypeError, () => Object.defineProperty(obj_1, 'immutableProperty', { value: 12 }));

// reassigning the value with defineProperty while configurable: false is set will not work with accessor descriptor
// [DISCLAIMER]: get: () => { this._value } won't work and will return null since there is no this in anonymous function
Object.defineProperty(obj_1, 'dummy', { 
  get() { return this._value + 7 }, set(n) { this._value = n }, configurable: false });
assert(obj_1.dummy === 8);
assertError(TypeError, () => 
  Object.defineProperty(obj_1, 'dummy', { get() { return this._value }, set(n) { this._value = n * 2 } }));

// Reassigning accessor descriptor attributes while configurable: false will give an error
assertError(TypeError, () => Object.defineProperty(obj_1, 'dummy', { 
      get() { return this._value + 2 }, set(n) { this._value = n * 2 } 
    }
  )
);
assertError(TypeError, () => Object.defineProperty(obj_1, 'dummy', { enumerable: true }));
assertError(TypeError, () => Object.defineProperty(obj_1, 'dummy', { configurable: true }));
// reassigning writable will also give an error. In an accessor descriptor, writable is not an attribute anyway
assertError(TypeError, () => Object.defineProperty(obj_1, 'dummy', { writable: false }));


// You could set object's attributes immutable one by one, but if you want to create an entire deeply immutable object
// you can use Object.freeze() multiple times (for nesting)
const frozenObject = {
  value: 1,
  previousValues: [1, 2],
  prototypeObject: { value: 2 }
}

Object.freeze(frozenObject);
assertError(TypeError, () => frozenObject.value = 3);

// Object.freeze is a shallow operation, meaning it will only work for the properties directly in the object.
// nested properties won't be changed
frozenObject.previousValues.push(3)
assert(frozenObject.previousValues.includes(3))

Object.freeze(frozenObject.previousValues);
// Now, even the array in it isn't changeable anymore
assertError(TypeError, () => frozenObject.previousValues.push(3));
assertError(TypeError, () => frozenObject.previousValues.pop());

// that serves for plain objects as well
Object.freeze(frozenObject.prototypeObject);
assertError(TypeError, () => frozenObject.prototypeObject.value = 3);
assertError(TypeError, () => frozenObject.prototypeObject.something = 1);