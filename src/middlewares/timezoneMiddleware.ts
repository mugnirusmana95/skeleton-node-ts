import moment from 'moment-timezone'

export const timezoneMiddleware = (req: Req, res: Res, next: Next) => {
  const timezone = req.headers['x-client-timezone']

  req.timezone =
    typeof timezone === 'string' && moment.tz.zone(timezone)
      ? timezone
      : 'UTC'

  next()
}