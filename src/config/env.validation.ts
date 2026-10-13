import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    DATABASE_URL: z.string().url(),
    FRONTEND_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    RATE_LIMIT_TTL_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    PASSWORD_RESET_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    RESEND_API_KEY: z.string().trim().min(1).optional(),
    MAIL_FROM: z.string().email().optional(),
    RESEND_API_URL: z.string().url().default('https://api.resend.com/emails'),
    API_DOCS_ENABLED: z
      .enum(['true', 'false'])
      .default('true')
      .transform((value) => value === 'true'),
  })
  .superRefine((value, context) => {
    const endpoint = new URL(value.RESEND_API_URL);
    const localTestEndpoint =
      value.NODE_ENV === 'test' &&
      endpoint.protocol === 'http:' &&
      endpoint.hostname === '127.0.0.1' &&
      Boolean(endpoint.port) &&
      !endpoint.username &&
      !endpoint.password &&
      !endpoint.search &&
      !endpoint.hash &&
      endpoint.pathname === '/emails';
    if (
      value.RESEND_API_URL !== 'https://api.resend.com/emails' &&
      !localTestEndpoint
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RESEND_API_URL'],
        message:
          'Only the official Resend endpoint or a loopback test transport is allowed',
      });
    if (value.PASSWORD_RESET_ENABLED) {
      if (!value.RESEND_API_KEY || !value.MAIL_FROM)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['PASSWORD_RESET_ENABLED'],
          message: 'Enabled recovery requires RESEND_API_KEY and MAIL_FROM',
        });
      const frontend = new URL(value.FRONTEND_URL);
      if (
        frontend.username ||
        frontend.password ||
        frontend.pathname !== '/' ||
        !['http:', 'https:'].includes(frontend.protocol) ||
        frontend.search ||
        frontend.hash ||
        (value.NODE_ENV === 'production' && frontend.protocol !== 'https:')
      )
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRONTEND_URL'],
          message:
            'Recovery links require a canonical frontend origin and HTTPS in production',
        });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }

  return parsed.data;
}
