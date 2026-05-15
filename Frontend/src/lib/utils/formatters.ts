import i18next from "i18next";

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const formatDate = (value?: string | null) => {
  if (!value) return i18next.t("admin:never");
  return new Intl.DateTimeFormat(
    i18next.language === "am"
      ? "am-ET"
      : i18next.language === "om"
        ? "om-ET"
        : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(value));
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return i18next.t("admin:never");
  return new Intl.DateTimeFormat(
    i18next.language === "am"
      ? "am-ET"
      : i18next.language === "om"
        ? "om-ET"
        : "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
};

export const roleLabel = (role: string) => {
  if (role === "user") return i18next.t("admin:customer");
  return i18next.t("admin:admin");
};
