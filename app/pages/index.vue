<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

type PatreonTier = {
    id: string;
    label: string;
    members: string[];
    memberCount: number;
};

useHead({
    title: "Elegon",
    meta: [
        {
            name: "description",
            content:
                "Elegon is a solo-developed MMO-RPG inspired by Classic World of Warcraft. Experience epic adventures with no pay-to-win mechanics or cosmetic microtransactions. Fair gameplay for everyone.",
        },
        {
            name: "keywords",
            content:
                "MMO-RPG, MMORPG, World of Warcraft inspired, no pay-to-win, solo developer, indie game",
        },
        {
            property: "og:title",
            content: "Elegon - A Fair MMO-RPG Without Pay-to-Win",
        },
        {
            property: "og:description",
            content:
                "An MMO-RPG inspired by Classic WoW, developed solo with a commitment to fair gameplay. No pay-to-win. No cosmetic microtransactions.",
        },
        {
            property: "og:type",
            content: "website",
        },
        {
            property: "og:image",
            content:
                "https://cdn1.dotesports.com/wp-content/uploads/2022/04/19140145/WoW-AzureSpan-1024x575.jpg",
        },
        {
            name: "twitter:card",
            content: "summary_large_image",
        },
        {
            name: "twitter:title",
            content: "Elegon - Fair MMO-RPG Gaming",
        },
        {
            name: "twitter:description",
            content:
                "Experience a true MMO-RPG without pay-to-win mechanics. Inspired by Classic WoW, built with fair gameplay in mind.",
        },
    ],
});

const items = ref<AccordionItem[]>([
    {
        label: "How will Elegon be monetized?",
        content:
            "Elegon will be supported by a single monthly subscription. There will never be an in-game store selling cosmetics or pay-to-win items. The only purchases that may exist outside the subscription are things like merchandise, but nothing that could exist within the world of Elegon itself.",
    },
    {
        label: "What platforms is Elegon available on?",
        content:
            "Elegon can be played through Steam on Windows, Linux, and macOS. Currently, the macOS version requires a small workaround because the application is not code-signed yet, but this will be addressed in the future.",
    },
    {
        label: "Who are you? Have you built anything like this before?",
        content:
            "My name is Keone. I'm a 28-year-old software developer working full-time at a non-gaming company in London, UK. In my free time, I dedicate as much time as possible to developing Elegon. I have around 10 years of experience in software development, and Elegon is my first large-scale game project.",
    },
    {
        label: "What technology does Elegon use?",
        content:
            "Elegon is built using the Godot game engine. I chose Godot because it is open source, highly flexible, and capable of supporting everything this project needs. It also allows me to modify the engine itself if necessary. For networking and backend systems, Elegon uses SpacetimeDB, which provides high performance and a modern architecture well suited to persistent online worlds.",
    },
    {
        label: "How can I support the development of Elegon?",
        content:
            "Your support is greatly appreciated, but never required. If you'd like to support the project financially, you can become a member on Patreon or Ko-fi. If that is not possible, that is completely fine too; simply watching the devlogs on YouTube, participating in the playtest, and sharing feedback helps more than you might think.",
    },
]);

const supporterTierClasses = [
    "text-orange-500",
    "text-purple-500",
    "text-blue-500",
];

const {
    data: patreonMembers,
    pending: patreonPending,
    error: patreonError,
} = await useFetch<{ tiers: PatreonTier[] }>("/api/patreon-members", {
    default: () => ({ tiers: [] }),
});
</script>

<template>
    <div>
        <section id="home" class="hero-banner-section">
            <div class="hero-banner-media" aria-hidden="true"></div>
            <div class="hero-banner-overlay" aria-hidden="true"></div>
            <div class="hero-banner-fade" aria-hidden="true"></div>
            <UContainer class="hero-banner-shell">
                <div class="hero-banner-copy hero-banner-text space-y-6">
                    <div class="space-y-3">
                        <h1
                            class="text-4xl md:text-6xl font-bold text-white alice-regular"
                        >
                            Welcome to <span class="text-primary">Elegon</span>!
                        </h1>
                        <p class="text-xl md:text-2xl text-white/75 alice-regular">
                            An MMO-RPG inspired by the classics
                        </p>
                    </div>

                    <div class="space-y-4">
                        <p class="text-lg md:text-xl text-white/80 max-w-2xl">
                            Step into a world where your progression matters and
                            adventure awaits.
                        </p>
                        <div class="flex flex-wrap gap-3">
                            <UButton
                                size="lg"
                                icon="i-simple-icons-steam"
                                color="primary"
                                to="https://store.steampowered.com/app/4235360/Elegon/"
                                target="_blank"
                            >
                                Wishlist on Steam
                            </UButton>
                            <UButton
                                size="lg"
                                icon="i-simple-icons-discord"
                                variant="outline"
                                color="neutral"
                                to="https://discord.gg/4G32msBn7V"
                                target="_blank"
                                class="hero-banner-outline-button"
                            >
                                Join the Community
                            </UButton>
                        </div>
                    </div>
                </div>
            </UContainer>
        </section>

        <UContainer class="pb-12 md:pb-20 flex flex-col space-y-10">
            <div id="about" class="min-h-96 py-4 rounded-lg text-lg">
                <p class="text-neutral-600 dark:text-neutral-400">
                    Hey, I'm Keone, a solo developer building Elegon. I started
                    this project because I have always been passionate about
                    this genre, but in recent years I have felt that the number
                    of truly compelling online worlds, ones that respect the
                    time and effort of their players, has been fading.
                </p>
                <br />
                <p class="text-neutral-600 dark:text-neutral-400">
                    Elegon is an always-online, open-world MMORPG where you are
                    not the chosen hero, but rather a small part of a much
                    larger story.
                </p>
                <br />
                <p class="text-neutral-600 dark:text-neutral-400">
                    Watch your character grow stronger over time, defeat
                    powerful enemies, make friends along the way, and stand
                    against the evils of the world in pursuit of its greatest
                    rewards.
                </p>
                <br />
                <p class="text-neutral-600 dark:text-neutral-400">
                    Elegon is currently in open development, meaning you are
                    welcome to join the 24/7 Steam playtest and help shape the
                    game with your feedback. Once the game reaches version 1.0,
                    development will continue as the world expands and evolves.
                </p>
            </div>

            <div
                class="rounded-lg text-lg flex flex-col lg:flex-row overflow-hidden"
            >
                <div class="flex flex-1 ambient-panel overflow-visible">
                    <div class="ambient-shape ambient-shape-video-a"></div>
                    <div class="ambient-shape ambient-shape-video-b"></div>
                    <iframe
                        width="100%"
                        src="https://www.youtube.com/embed/videoseries?list=PLcd5IWpvYJ8Q6G1l0s4IiyWWPK5RvlLln"
                        title="YouTube playlist"
                        frameborder="0"
                        class="relative z-10 min-h-[260px] rounded-lg"
                        allow="
                            accelerometer;
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            gyroscope;
                            picture-in-picture;
                        "
                        allowfullscreen
                    >
                    </iframe>
                </div>
                <div class="flex flex-1 p-4 flex-col">
                    <h2 class="text-4xl font-bold mb-4 alice-regular">
                        Weekly Devlogs
                    </h2>
                    <p class="text-neutral-600 dark:text-neutral-400">
                        Follow the development of Elegon by subscribing to the
                        YouTube channel, where I share weekly updates and
                        behind-the-scenes devlogs about the progress of the
                        game.
                    </p>
                    <p class="text-neutral-600 dark:text-neutral-400 mt-4">
                        Developing Elegon openly with the community is really
                        important to me. It gives me the opportunity to hear
                        your real-time feedback and ideas, while also keeping
                        you up to date with the latest progress as the world
                        continues to grow.
                    </p>
                </div>
            </div>

            <div id="vision" class="min-h-96 py-4 rounded-lg text-lg">
                <h2 class="text-4xl font-bold mb-4 alice-regular">
                    The Vision
                </h2>

                <p class="text-neutral-600 dark:text-neutral-400">
                    The vision for Elegon is to create an online world inspired
                    by the spirit of classic MMORPGs such as early World of
                    Warcraft and other foundational RPGs that defined the genre.
                    These games created worlds that felt meaningful, social, and
                    rewarding to explore. Elegon aims to bring that feeling back
                    while thoughtfully embracing modern ideas where they
                    genuinely improve the experience.
                </p>
                <br />
                <p class="text-neutral-600 dark:text-neutral-400">
                    Progression in Elegon is designed to feel earned. Your
                    character grows stronger through time, effort, and
                    adventure, not through purchases. There will never be an
                    in-game cash shop selling cosmetics or pay-to-win items.
                    Instead, the game will be supported through a simple monthly
                    subscription, allowing development to focus entirely on the
                    quality of the world and the experience of the players.
                </p>
                <br />
                <p class="text-neutral-600 dark:text-neutral-400">
                    Elegon is not intended to be a short-term project. It is a
                    living world that will continue to grow and evolve for years
                    to come. As a solo developer, this project is a huge
                    personal passion of mine, and my goal is to build a world
                    that players can invest in, return to, and feel a genuine
                    part of.
                </p>
            </div>

            <div class="py-4 rounded-lg text-lg">
                <h2 class="text-4xl font-bold mb-4 alice-regular">
                    Patreon Supporters
                </h2>
                <div v-if="patreonPending" class="text-neutral-500">
                    Loading Patreon supporters...
                </div>
                <div
                    v-else-if="patreonError"
                    class="text-red-500 dark:text-red-400"
                >
                    Patreon supporters are temporarily unavailable.
                </div>
                <div v-else class="space-y-1">
                    <UMarquee
                        v-for="(tier, index) in patreonMembers?.tiers ?? []"
                        :key="tier.id"
                        class="w-full rounded-lg p-2 mb-1 alice-regular"
                        :class="
                            supporterTierClasses[index] || 'text-neutral-500'
                        "
                    >
                        <p
                            v-for="supporter in tier.members"
                            :key="`${tier.id}-${supporter}`"
                        >
                            {{ supporter }}
                        </p>
                    </UMarquee>
                </div>
            </div>

            <div id="faq" class="min-h-96 py-4 rounded-lg">
                <h2 class="text-4xl font-bold mb-4 alice-regular">FAQ</h2>

                <UAccordion :items="items" />
            </div>
        </UContainer>
    </div>
</template>
