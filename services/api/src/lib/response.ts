const allowedOrigins =
  process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map(origin => origin.trim()) ?? [];

function buildHeaders(
  origin?: string,
  headers: Record<string, string> = {}
) {

  console.log("Allowed origins: ",allowedOrigins);
  const corsOrigin =
    origin &&
      allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

      console.log("Cors origin: ", corsOrigin);

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    // "Access-Control-Allow-Headers":
    //   "Content-Type,Authorization",
    // "Access-Control-Allow-Methods":
    //   "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Credentials": "true",

    ...headers,
  };
}

type Options = {
  statusCode?: number;
  origin?: string;
  headers?: Record<string, string>;
};

export function response(
  data: unknown,
  options: Options = {}
) {
  const {
    statusCode,
    origin,
    headers = {},
  } = options;

  return {
    statusCode,
    headers: buildHeaders(
      origin,
      headers
    ),
    body: JSON.stringify(data),
  };
}