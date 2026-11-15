export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: status >= 500 ? 'Something went wrong' : err.message,
  });
}