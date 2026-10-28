// @cordele/shared/error-model.
// Covers RFC 7807 ProblemDetail fields normalised by the ErrorNormalize interceptor.
export interface AppError {
  readonly code: string;
  readonly message: string;
  /** HTTP status code, when available. */
  readonly httpStatus?: number;
  /** `title` from RFC 7807 ProblemDetail. */
  readonly title?: string;
  /** `detail` from RFC 7807 ProblemDetail. */
  readonly detail?: string;
  /** Mirrors X-Correlation-Id; displayed to the user for support reference. */
  readonly correlationId?: string;
}
