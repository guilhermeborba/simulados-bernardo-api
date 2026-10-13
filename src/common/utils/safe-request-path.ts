/** Request logs and error responses must not copy secrets from URL queries. */
export function safeRequestPath(request: {
  path?: string;
  originalUrl?: string;
}): string {
  return (request.path ?? request.originalUrl ?? '/').split(/[?#]/, 1)[0];
}
