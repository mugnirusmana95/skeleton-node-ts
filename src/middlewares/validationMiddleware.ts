import { ZodType } from 'zod'

import { UnprocessableEntity } from '~/helpers/exceptionHelper'

type TValidationTarget = 'body' | 'query' | 'params' | 'req'

const formatZodError = (issues: { path: PropertyKey[], message: string }[]) => {
  const object = Object.fromEntries(
    issues.map((issue) => [
      issue.path.map(String).join('.'),
      issue.message,
    ]),
  )

  const array = Array.from(
    new Map(
      issues.map((issue) => [
        issue.path.map(String).join('.'),
        {
          field: issue.path.map(String).join('.'),
          message: issue.message,
        },
      ]),
    ).values(),
  )

  return { object, array }
}

export const validate = (
  schema: ZodType,
  target: TValidationTarget = 'body',
) => {
  return async (req: Req, res: Res, next: Next) => {
    res.locals.requestContext = {
      method: req.method,
      url: req.originalUrl,
      params: { ...req.params },
      query: { ...req.query },
      body: { ...req.body },
      auth: { ...req.auth }
    }

    const dataToValidate = target === 'req'
      ? { ...req.params, ...req.body, ...req.query }
      : req[target]

    const result = await schema.safeParseAsync(dataToValidate)

    if (!result.success) {
      const validationResult = formatZodError(result.error.issues)

      throw new UnprocessableEntity('', validationResult)
    }

    return next()
  }
}
