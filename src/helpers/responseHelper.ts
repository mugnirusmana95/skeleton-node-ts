import { Response } from 'express'

type TResponseParams<T = unknown> = {
  status: number
  message?: string
  data?: T
  field?: T
}

export type TResponseResult<T = unknown> = {
  status: number
  isSuccess: boolean
  message?: string
  data?: T
  field?: T
}

const defaultMessage: Record<number, string> = {
  200: 'Success',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error'
}

export const response = <T = unknown>(
  res: Response,
  params: TResponseParams<T>
) => {
  const { status, message, data, field } = params

  const isSuccess = status >= 200 && status < 300

  const result: TResponseResult = {
    status: status,
    isSuccess: isSuccess,
    message: message || defaultMessage[status] || 'Internal Server Error',
  }

  if (data) {
    result.data = data
  }

  if (field || status === 422) {
    result.field = field ?? null
  }

  return res.status(status).json(result)
}