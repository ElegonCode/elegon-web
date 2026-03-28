type PatreonMemberResource = {
  id: string;
  type: "member";
  attributes?: {
    full_name?: string | null;
    patron_status?: string | null;
  };
  relationships?: {
    currently_entitled_tiers?: {
      data?: Array<{
        id: string;
        type: "tier";
      }>;
    };
  };
};

type PatreonTierResource = {
  id: string;
  type: "tier";
  attributes?: {
    title?: string | null;
  };
};

type PatreonMembersResponse = {
  data: PatreonMemberResource[];
  included?: PatreonTierResource[];
  meta?: {
    pagination?: {
      cursors?: {
        next?: string | null;
      };
    };
  };
};

type TierConfig = {
  id: string;
  label: string;
};

const PATREON_API_BASE = "https://www.patreon.com/api/oauth2/v2";

function getTierConfigs(): TierConfig[] {
  const config = useRuntimeConfig();
  const tiers = [
    { id: config.patreonTier1Id, label: config.patreonTier1Label },
    { id: config.patreonTier2Id, label: config.patreonTier2Label },
    { id: config.patreonTier3Id, label: config.patreonTier3Label },
  ];

  return tiers.filter((tier): tier is TierConfig => Boolean(tier.id));
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const tierConfigs = getTierConfigs();

  if (!config.patreonAccessToken || !config.patreonCampaignId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Patreon environment variables are not configured.",
    });
  }

  if (tierConfigs.length !== 3) {
    throw createError({
      statusCode: 500,
      statusMessage: "Three Patreon tier IDs must be configured.",
    });
  }

  const membersByTier = new Map<string, Set<string>>();
  let nextCursor: string | null | undefined;

  for (const tier of tierConfigs) {
    membersByTier.set(tier.id, new Set());
  }

  do {
    const query = new URLSearchParams({
      include: "currently_entitled_tiers",
      "fields[member]": "full_name,patron_status",
      "fields[tier]": "title",
      "page[count]": "1000",
    });

    if (nextCursor) {
      query.set("page[cursor]", nextCursor);
    }

    const url = `${PATREON_API_BASE}/campaigns/${config.patreonCampaignId}/members?${query.toString()}`;

    let response: PatreonMembersResponse;

    try {
      response = await $fetch<PatreonMembersResponse>(url, {
        headers: {
          Authorization: `Bearer ${config.patreonAccessToken}`,
          "User-Agent": config.patreonUserAgent,
        },
      });
    } catch (error: any) {
      const statusCode = error?.response?.status ?? 500;
      const statusMessage =
        error?.data?.errors?.[0]?.detail ??
        error?.message ??
        "Failed to fetch Patreon members.";

      throw createError({
        statusCode,
        statusMessage,
      });
    }

    for (const member of response.data ?? []) {
      if (
        member.type !== "member" ||
        member.attributes?.patron_status !== "active_patron"
      ) {
        continue;
      }

      const memberName = member.attributes?.full_name?.trim();

      if (!memberName) {
        continue;
      }

      const entitledTierIds =
        member.relationships?.currently_entitled_tiers?.data?.map(
          (tier) => tier.id,
        ) ?? [];

      for (const tierId of entitledTierIds) {
        membersByTier.get(tierId)?.add(memberName);
      }
    }

    nextCursor = response.meta?.pagination?.cursors?.next;
  } while (nextCursor);

  const tiers = tierConfigs.map((tier) => {
    const members = Array.from(membersByTier.get(tier.id) ?? []).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    return {
      id: tier.id,
      label: tier.label,
      members,
      memberCount: members.length,
    };
  });

  return { tiers };
});
