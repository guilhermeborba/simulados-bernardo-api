import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Only the provider sees recipient/link. No request, response or exception is logged. */
@Injectable()
export class ResendMailService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return (
      this.config.get<boolean>('PASSWORD_RESET_ENABLED') === true &&
      Boolean(this.config.get<string>('RESEND_API_KEY')) &&
      Boolean(this.config.get<string>('MAIL_FROM'))
    );
  }
  private async send(
    email: string,
    subject: string,
    text: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        this.config.get<string>('RESEND_API_URL') ??
          'https://api.resend.com/emails',
        {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(750),
          headers: {
            Authorization: `Bearer ${this.config.getOrThrow<string>('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            from: `Simulados Bernardo <${this.config.getOrThrow<string>('MAIL_FROM')}>`,
            to: [email],
            subject,
            text,
          }),
        },
      );
      // Provider error bodies may contain recipient addresses. Do not retain or log them.
      await response.body?.cancel();
      return response.ok;
    } catch {
      return false;
    }
  }
  async sendRecovery(email: string, link: string, identity: string) {
    return this.send(
      email,
      'Redefina sua senha — Simulados Bernardo',
      `Recebemos um pedido para redefinir sua senha.\n\nAbra este link e escolha uma nova senha:\n${link}\n\nO link expira em 30 minutos e pode ser usado uma única vez. Se você não fez este pedido, ignore esta mensagem.`,
      `password-reset/${identity}`,
    );
  }
  async sendPasswordChanged(email: string, identity: string) {
    return this.send(
      email,
      'Sua senha foi alterada — Simulados Bernardo',
      'A senha da sua conta foi alterada. As sessões anteriores foram encerradas. Se você não reconhece esta alteração, solicite uma nova recuperação no site e entre em contato com o responsável pela plataforma.',
      `password-changed/${identity}`,
    );
  }
}
