import { randomUUID } from "node:crypto";

/**
 * @type {import("express").RequestHandler}
 */
const apiLogger = (req, res, next) => {
  const requestId = randomUUID();
  const startTime = process.hrtime.bigint();

  req.requestId = requestId;

  const originalEnd = res.end;

  res.end = /** @type {typeof res.end} */ (
    function (...args) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;

      console.log(
        JSON.stringify({
          requestId,
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: `${duration.toFixed(2)}ms`,
          ip: req.ip,
          userAgent: req.get("user-agent"),
        }),
      );

      return originalEnd.apply(res, args);
    }
  );

  next();
};

export default apiLogger;
