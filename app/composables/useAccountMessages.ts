import { ACCOUNT_MESSAGES, type AccountMessageKey } from "~/utils/accountMessages";
import { accountAgeDays, formatAccountDate } from "~/utils/accountStats";

type Params = Record<string, string | number>;
type PluralKey = { [K in AccountMessageKey]: K extends `${infer Base}_other` ? Base : never }[AccountMessageKey];

/** Translated copy and date formatting for the account page, following the URL's locale. */
export function useAccountMessages() {
  const { locale } = useLocale();
  const fill = (text: string, params?: Params) =>
    params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text;
  const lookup = (key: string) =>
    ACCOUNT_MESSAGES[locale.value][key as AccountMessageKey] ?? ACCOUNT_MESSAGES.en[key as AccountMessageKey];
  const t = (key: AccountMessageKey, params?: Params) => fill(lookup(key) ?? key, params);
  const tn = (key: PluralKey, count: number, params?: Params) => {
    const form = new Intl.PluralRules(locale.value).select(count);
    const text = lookup(`${key}_${form}`) ?? lookup(`${key}_other`) ?? key;
    return fill(text, { count, ...params });
  };
  // English keeps the site's day-month-year style; other languages use their own.
  const intlLocale = computed(() => (locale.value === "en" ? "en-GB" : locale.value));
  const formatDate = (value: string | null | undefined) =>
    value && Number.isFinite(Date.parse(value)) ? formatAccountDate(value, intlLocale.value) : t("profile.notRecorded");
  const formatAge = (value: string | null | undefined) => {
    const days = accountAgeDays(value);
    return days === null ? null : tn("profile.daysAgo", days);
  };
  return { locale, t, tn, formatDate, formatAge };
}
