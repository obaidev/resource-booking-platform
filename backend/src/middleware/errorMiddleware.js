export const errorMiddleware = (err, req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || "Something went wrong",
  });
};
