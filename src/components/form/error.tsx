import { ErrorResponse } from "../../api/api";

export function handleApiError(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    const err = error as ErrorResponse;
    return `Помилка ${err.code}: ${err.message}${
      err.waitUntil ? ` (повторіть після ${err.waitUntil})` : ""
    }`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Сталася невідома помилка";
}
