import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'

import { response } from '~/helpers/responseHelper'

type TValidationTarget = 'body' | 'query' | 'params'

const formatZodError = (issues: { path: PropertyKey[], message: string }[]) => {
  const object = Object.fromEntries(
    issues.map((issue) => [
      issue.path.map(String).join('.'),
      issue.message,
    ])
  )

  const array = issues.map((issue) => ({
    field: issue.path.map(String).join('.'),
    message: issue.message,
  }))

  return { object, array }
}

export const validate = (
  schema: ZodType,
  target: TValidationTarget = 'body',
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req[target])

    if (!result.success) {
      const validationResult = formatZodError(result.error.issues)

      return response(res, {
        status: 422,
        message: 'Validation Error',
        field: validationResult,
      })
    }

    return next()
  }
}
