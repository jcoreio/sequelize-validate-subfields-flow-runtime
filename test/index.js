// @flow

import t, { reify } from 'flow-runtime'
import type { Type } from 'flow-runtime'
import { validateWithFlowRuntime } from '../src'
import { expect } from 'chai'

type PostalCode = string
const PostalCodeType = (reify: Type<PostalCode>)
PostalCodeType.addConstraint(
  (postalCode: string): ?string => {
    if (!/^\d{4,5}$/.test(postalCode))
      return 'must be a 4 or 5-digit postal code'
  }
)

type NonEmptyString = string
const NonEmptyStringType = (reify: Type<NonEmptyString>)
NonEmptyStringType.addConstraint(
  (value: string): ?string => {
    if (value === '') return 'must not be empty'
  }
)

type Address = {
  line1: NonEmptyString,
  line2?: NonEmptyString,
  postalCode: PostalCode,
  state: NonEmptyString,
}

type User = {
  username: NonEmptyString,
  address: Address,
}

const UserType = (reify: Type<User>)

describe('validateWithFlowRuntime', () => {
  it('works for non-reduxFormStyle', () => {
    const validator = validateWithFlowRuntime(UserType)

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address', 'state'], message: 'must be a string' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address'], message: 'must be an object' }],
      })
    }
  })
  it('works for reduxFormStyle', () => {
    const validator = validateWithFlowRuntime(UserType, {
      reduxFormStyle: true,
    })

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address', 'state'], message: 'must be a string' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address', '_error'], message: 'must be an object' }],
      })
    }
  })
  it('works for validation function', () => {
    const validator = validateWithFlowRuntime(user =>
      t.validate(UserType, user)
    )

    try {
      validator({
        username: '',
        address: {
          line1: '',
          postalCode: '123',
        },
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [
          { path: ['username'], message: 'must not be empty' },
          { path: ['address', 'line1'], message: 'must not be empty' },
          {
            path: ['address', 'postalCode'],
            message: 'must be a 4 or 5-digit postal code',
          },
          { path: ['address', 'state'], message: 'must be a string' },
        ],
      })
    }

    try {
      validator({
        username: 'andy',
        address: null,
      })
      throw new Error('expected an error to be thrown')
    } catch (error) {
      expect(error.validation).to.deep.equal({
        errors: [{ path: ['address'], message: 'must be an object' }],
      })
    }
  })
  it('works for function returning null', () => {
    const validator = validateWithFlowRuntime(user => null)
    validator({
      username: '',
      address: {
        line1: '',
        postalCode: '123',
      },
    })
  })
})
