// @flow

import t, {validate} from 'flow-runtime'
import { get } from "lodash"
import type {Type, Validation} from 'flow-runtime'
import {validateSubfields} from 'sequelize-validate-subfields'
import type {FieldValidation} from 'sequelize-validate-subfields'

const arrayType = t.array()
const objectType = t.object()

type ConvertOptions = {
  reduxFormStyle?: boolean,
}

export function * convertValidationErrors(
  validation: Validation,
  options: ConvertOptions = {}
): Iterable<FieldValidation> {
  for (let [path, message, type] of validation.errors) {
    if (options.reduxFormStyle && (
      arrayType.acceptsType(type) ||
      objectType.acceptsType(type) ||
      get(validation.input, path) instanceof Object)
    ) {
      yield {path: [...path, '_error'], message}
    }
    else yield {path, message}
  }
}

export function validateWithFlowRuntime(
  type: Type<any> | (value: any) => ?Validation,
  options: ConvertOptions = {}
): (value: any) => void {
  return validateSubfields(
    function * (value: any): Iterable<FieldValidation> {
      const validation = typeof type === 'function'
        ? type(value)
        : validate(type, value)
      if (validation) {
        yield * convertValidationErrors(validation, options)
      }
    }
  )
}
