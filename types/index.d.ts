export interface AxeDzOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface SdkResponse<T = unknown> {
  success: true;
  data: T;
  meta: Record<string, unknown>;
}

export interface ErrorContext {
  statusCode?: number | null;
  rawResponse?: unknown;
  request?: {
    method?: string;
    url?: string | null;
    baseURL?: string | null;
    headers?: Record<string, string>;
  } | null;
}

export class AxeDzError extends Error {
  statusCode: number | null;
  rawResponse: unknown;
  request: ErrorContext['request'];
  constructor(message?: string, context?: ErrorContext);
}

export class AuthenticationError extends AxeDzError {}
export class ValidationError extends AxeDzError {
  errors: unknown;
}
export class RateLimitError extends AxeDzError {
  retryAfter: string | number | null;
}
export class NetworkError extends AxeDzError {
  code: string | null;
}
export class ServerError extends AxeDzError {}

export interface SmsSendParams {
  to: string | string[];
  message: string;
  senderName?: string;
  provider?: string;
  signal?: AbortSignal;
}

export interface EmailSendParams {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
  text?: string;
  message?: string;
  body_type?: 'text' | 'html';
  senderName?: string;
  callback_url?: string;
  callbackData?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface WalletQueryOptions {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

declare class SMS {
  send(params: SmsSendParams): Promise<SdkResponse>;
}

declare class Email {
  send(params: EmailSendParams): Promise<SdkResponse>;
}

declare class Wallet {
  getBalance(options?: { signal?: AbortSignal }): Promise<SdkResponse>;
  balance(options?: { signal?: AbortSignal }): Promise<SdkResponse>;
  getTransactions(options?: WalletQueryOptions): Promise<SdkResponse>;
}

export default class AxeDz {
  constructor(apiKey: string, options?: AxeDzOptions);
  sms: SMS;
  email: Email;
  wallet: Wallet;
  options: Required<Pick<AxeDzOptions, never>> & AxeDzOptions;
}

export {
  AxeDz,
  AuthenticationError,
  NetworkError,
  RateLimitError,
  ServerError,
  ValidationError,
};
