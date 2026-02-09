import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const safeLocale = locale && isLocale(locale) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default,
  };
});
