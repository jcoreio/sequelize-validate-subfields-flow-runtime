# sequelize-validate-subfields-flow-runtime

[![Build Status](https://travis-ci.org/jcoreio/sequelize-validate-subfields-flow-runtime.svg?branch=master)](https://travis-ci.org/jcoreio/sequelize-validate-subfields-flow-runtime)
[![Coverage Status](https://codecov.io/gh/jcoreio/sequelize-validate-subfields-flow-runtime/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/sequelize-validate-subfields-flow-runtime)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

use flow-runtime to validate JSON attributes of Sequelize models

# Installation

```sh
npm install --save flow-runtime sequelize-validate-subfields-flow-runtime
```

# Example

Using `reify` below requires `babel-plugin-flow-runtime` [to be configured](https://codemix.github.io/flow-runtime/#/docs)!

```js
import Sequelize from 'sequelize'
import {reify, validate} from 'flow-runtime'
import type {Type} from 'flow-runtime'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'
import {flattenValidationErrors} from 'sequelize-validate-subfields'

import sequelize from './sequelize'

type UserInfo = {
  phone: string,
  address: {
    line1: string,
    line2?: string,
    postalCode: number,
    state: string,
  }
}

const UserInfoType = (reify: Type<UserInfo>)

const User = Sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: {
        msg: 'required'
      }
    }
  },
  info: {
    type: Sequelize.JSON,
    validate: validateWithFlowRuntime(UserInfoType)
  }
})

try {
  User.create({
    username: '',
    address: {
      line2: 2,
      postalCode: '76034',
      state: 'TX',
    } 
  })
} catch (error) {
  if (error instanceof Sequelize.ValidationError) {
    console.error(flattenValidationErrors(error))
  } else {
    console.error(error)
  }
}
```
Output:
```
[
  {path: ['username'], message: 'required'},
  {path: ['address', 'line1'], message: 'must be a string'},
  {path: ['address', 'line2'], message: 'must be a string'},
  {path: ['address', 'postalCode'], message: 'must be a number'},
]
```

# API

## `convertValidationErrors(validation, [options])`

### Arguments

#### `validation: Validation`

A `flow-runtime` `Validation` object containing an `errors` array of `[path, message, type]` tuples.

#### `options?: {reduxFormStyle?: boolean}`

If `reduxFormStyle` is true, validation errors on object/array fields will be yielded for the `_error` subpath
under that field.

### Returns: `Iterable<FieldValidation>`

Yields `{path: Array<string | number>, message: string}` objects about validation errors, the format defined by
`sequelize-validate-subfields`.

## `validateWithFlowRuntime(typeOrValidator, [options])`

### Arguments

#### `typeOrValidator: Type<any> | ((value: any) => ?Validation)

A reified `flow-runtime` `Type`, or a function taking an attribute value and returning a `flow-runtime` `Validation`
object or `null`.  Errors from applying the given function or validating against the given type will be yielded in
`sequelize-validate-subfields` format.

#### `options?: {reduxFormStyle?: boolean}`

If `reduxFormStyle` is true, validation errors on object/array fields will be yielded for the `_error` subpath
under that field.

### Returns: `(value: any) => void`

A Sequelize custom attribute validation function that uses the given `typeOrValidator` to validate attribute values.
