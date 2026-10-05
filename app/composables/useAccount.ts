import type { AccountInfo } from "../../server/utils/accountAuth";

export function useAccount() {
  // The homepage is shared/cached. Personal data must only load in the browser.
  // A shared key keeps the header and account page in sync, including sign-out.
  return useFetch<{ enabled: boolean; account: AccountInfo | null }>("/api/account", {
    key: "elegon-account", server: false,
  });
}
