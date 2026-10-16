export enum TLanguageMiddleware {
  ID = 'id',
  EN = 'en',
}

export const languageMiddleware = (req: Req, res: Res, next: Next) => {
  const language = req.headers['x-client-language']

  req.language =
    typeof language === 'string' &&
      Object.values(TLanguageMiddleware).includes(language as TLanguageMiddleware)
      ? (language as TLanguageMiddleware)
      : TLanguageMiddleware.EN

  next()
}