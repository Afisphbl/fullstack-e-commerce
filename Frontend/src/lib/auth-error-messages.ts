export const mapAuthErrorMessage = (message: string): string => {
  if (!message) return "errors.unknown";

  // Check for common auth error patterns
  if (
    message.includes("Incorrect email or password") ||
    message.includes("invalid credentials")
  ) {
    return "invalidCredentials";
  }

  if (
    message.includes("does not exist") ||
    message.includes("User not found")
  ) {
    return "errors.userNotFound";
  }

  if (
    message.includes("already exists") ||
    message.includes("Email already in use")
  ) {
    return "errors.emailExists";
  }

  if (message.includes("too many attempts") || message.includes("Rate limit")) {
    return "errors.tooManyAttempts";
  }

  if (
    message.includes("token") ||
    message.includes("expired") ||
    message.includes("unauthorized")
  ) {
    return "errors.sessionExpired";
  }

  // If no specific mapping, return the original message or a generic error key
  return message;
};
