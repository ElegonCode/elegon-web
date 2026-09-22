import { SUPPORTED_LOCALES, type SupportedLocale } from "../../shared/locales";
export { LOCALE_NAMES, SUPPORTED_LOCALES, type SupportedLocale } from "../../shared/locales";

const messages = {
  en: {
    "nav.world": "World", "nav.features": "Features", "nav.devlogs": "Devlogs", "nav.vision": "Vision", "nav.faq": "FAQ", "nav.changelog": "Changelog", "nav.feedback": "Feedback", "nav.roadmap": "Roadmap", "nav.wishlist": "Wishlist", "nav.wishlistSteam": "Wishlist on Steam", "nav.menu": "Menu", "nav.openMenu": "Open menu",
    "hero.live": "Open playtest live 24/7 on Steam", "hero.tagline": "An MMORPG inspired by the classics", "hero.description": "Step into a world where your progression matters and adventure awaits.", "hero.community": "Join the Community", "hero.begin": "Begin your journey", "hero.platforms": "Available platforms",
    "seo.title": "Elegon: A Classic-Inspired Indie MMORPG", "seo.description": "A solo-developed MMORPG inspired by the classics. Earned progression, a living open world, and no pay-to-win. Join the free 24/7 playtest on Steam.",
    "footer.description": "A classic-inspired MMORPG, built in the open by a solo developer. Earned progression, a living world, and never a cash shop.", "footer.game": "The Game", "footer.community": "Community", "footer.shape": "Shape Elegon", "footer.world": "The World", "footer.vision": "The Vision", "footer.feedback": "Feedback Board", "footer.rights": "Solo-developed with passion. All rights reserved.", "footer.london": "Forged in London",
    "changelog.title": "Changelog & Patch Notes", "changelog.description": "Every Elegon patch note in one place: the latest fixes, improvements and new features added to the MMORPG's 24/7 Steam playtest.", "changelog.today": "Today", "changelog.yesterday": "Yesterday", "changelog.daysAgo": "days ago",
  },
  de: {
    "nav.world": "Welt", "nav.features": "Features", "nav.devlogs": "Entwicklerblogs", "nav.vision": "Vision", "nav.faq": "FAQ", "nav.changelog": "Änderungsprotokoll", "nav.feedback": "Feedback", "nav.roadmap": "Roadmap", "nav.wishlist": "Wunschliste", "nav.wishlistSteam": "Auf Steam wünschen", "nav.menu": "Menü", "nav.openMenu": "Menü öffnen",
    "hero.live": "Offener Playtest rund um die Uhr auf Steam", "hero.tagline": "Ein von Klassikern inspiriertes MMORPG", "hero.description": "Betritt eine Welt, in der dein Fortschritt zählt und Abenteuer auf dich warten.", "hero.community": "Der Community beitreten", "hero.begin": "Beginne deine Reise", "hero.platforms": "Verfügbare Plattformen",
    "seo.title": "Elegon: Ein von Klassikern inspiriertes Indie-MMORPG", "seo.description": "Ein von einem Solo-Entwickler geschaffenes MMORPG, inspiriert von den Klassikern. Verdienter Fortschritt, eine lebendige offene Welt und kein Pay-to-win. Spiele den kostenlosen 24/7-Playtest auf Steam.",
    "footer.description": "Ein von Klassikern inspiriertes MMORPG, offen entwickelt von einem Solo-Entwickler. Verdienter Fortschritt, eine lebendige Welt und kein Cash-Shop.", "footer.game": "Das Spiel", "footer.community": "Community", "footer.shape": "Gestalte Elegon", "footer.world": "Die Welt", "footer.vision": "Die Vision", "footer.feedback": "Feedback-Board", "footer.rights": "Mit Leidenschaft solo entwickelt. Alle Rechte vorbehalten.", "footer.london": "Geschmiedet in London",
    "changelog.title": "Änderungsprotokoll & Patchnotizen", "changelog.description": "Alle Elegon-Patchnotizen an einem Ort: die neuesten Fehlerbehebungen, Verbesserungen und Funktionen aus dem 24/7-Steam-Playtest.", "changelog.today": "Heute", "changelog.yesterday": "Gestern", "changelog.daysAgo": "Tage her",
  },
  es: {
    "nav.world": "Mundo", "nav.features": "Características", "nav.devlogs": "Diarios", "nav.vision": "Visión", "nav.faq": "Preguntas", "nav.changelog": "Novedades", "nav.feedback": "Comentarios", "nav.roadmap": "Hoja de ruta", "nav.wishlist": "Lista de deseos", "nav.wishlistSteam": "Añadir en Steam", "nav.menu": "Menú", "nav.openMenu": "Abrir menú",
    "hero.live": "Prueba abierta 24/7 en Steam", "hero.tagline": "Un MMORPG inspirado en los clásicos", "hero.description": "Entra en un mundo donde tu progreso importa y la aventura te espera.", "hero.community": "Únete a la comunidad", "hero.begin": "Comienza tu viaje", "hero.platforms": "Plataformas disponibles",
    "seo.title": "Elegon: un MMORPG indie inspirado en los clásicos", "seo.description": "Un MMORPG creado por un desarrollador en solitario e inspirado en los clásicos. Progresión ganada, mundo abierto vivo y sin pay-to-win. Únete a la prueba gratuita 24/7 en Steam.",
    "footer.description": "Un MMORPG inspirado en los clásicos, creado abiertamente por un desarrollador en solitario. Progresión ganada, un mundo vivo y nunca una tienda de efectivo.", "footer.game": "El juego", "footer.community": "Comunidad", "footer.shape": "Da forma a Elegon", "footer.world": "El mundo", "footer.vision": "La visión", "footer.feedback": "Tablero de comentarios", "footer.rights": "Desarrollado en solitario con pasión. Todos los derechos reservados.", "footer.london": "Forjado en Londres",
    "changelog.title": "Novedades y notas de parche", "changelog.description": "Todas las notas de parche de Elegon en un solo lugar: las últimas correcciones, mejoras y funciones de la prueba 24/7 de Steam.", "changelog.today": "Hoy", "changelog.yesterday": "Ayer", "changelog.daysAgo": "días atrás",
  },
  fr: {
    "nav.world": "Monde", "nav.features": "Fonctionnalités", "nav.devlogs": "Journaux", "nav.vision": "Vision", "nav.faq": "FAQ", "nav.changelog": "Mises à jour", "nav.feedback": "Avis", "nav.roadmap": "Feuille de route", "nav.wishlist": "Liste de souhaits", "nav.wishlistSteam": "Ajouter sur Steam", "nav.menu": "Menu", "nav.openMenu": "Ouvrir le menu",
    "hero.live": "Playtest ouvert 24 h/24, 7 j/7 sur Steam", "hero.tagline": "Un MMORPG inspiré des classiques", "hero.description": "Entrez dans un monde où votre progression compte et où l'aventure vous attend.", "hero.community": "Rejoindre la communauté", "hero.begin": "Commencez votre voyage", "hero.platforms": "Plateformes disponibles",
    "seo.title": "Elegon : un MMORPG indépendant inspiré des classiques", "seo.description": "Un MMORPG développé en solo et inspiré des classiques. Une progression méritée, un monde ouvert vivant et aucun pay-to-win. Rejoignez le playtest gratuit 24 h/24 sur Steam.",
    "footer.description": "Un MMORPG inspiré des classiques, développé ouvertement par un créateur solo. Une progression méritée, un monde vivant et jamais de boutique en jeu.", "footer.game": "Le jeu", "footer.community": "Communauté", "footer.shape": "Façonnez Elegon", "footer.world": "Le monde", "footer.vision": "La vision", "footer.feedback": "Tableau d'avis", "footer.rights": "Développé en solo avec passion. Tous droits réservés.", "footer.london": "Forgé à Londres",
    "changelog.title": "Mises à jour et notes de patch", "changelog.description": "Toutes les notes de patch d'Elegon au même endroit : les derniers correctifs, améliorations et contenus du playtest Steam 24 h/24.", "changelog.today": "Aujourd'hui", "changelog.yesterday": "Hier", "changelog.daysAgo": "jours plus tôt",
  },
  "pt-BR": {
    "nav.world": "Mundo", "nav.features": "Recursos", "nav.devlogs": "Diários", "nav.vision": "Visão", "nav.faq": "Perguntas", "nav.changelog": "Novidades", "nav.feedback": "Feedback", "nav.roadmap": "Roteiro", "nav.wishlist": "Lista de desejos", "nav.wishlistSteam": "Adicionar à Steam", "nav.menu": "Menu", "nav.openMenu": "Abrir menu",
    "hero.live": "Playtest aberto 24 horas por dia na Steam", "hero.tagline": "Um MMORPG inspirado nos clássicos", "hero.description": "Entre em um mundo em que sua progressão importa e a aventura espera por você.", "hero.community": "Entrar na comunidade", "hero.begin": "Comece sua jornada", "hero.platforms": "Plataformas disponíveis",
    "seo.title": "Elegon: um MMORPG indie inspirado nos clássicos", "seo.description": "Um MMORPG criado por um desenvolvedor solo e inspirado nos clássicos. Progressão conquistada, mundo aberto vivo e sem pay-to-win. Entre no playtest gratuito 24 horas por dia na Steam.",
    "footer.description": "Um MMORPG inspirado nos clássicos, criado abertamente por um desenvolvedor solo. Progressão conquistada, mundo vivo e nenhuma loja de dinheiro.", "footer.game": "O jogo", "footer.community": "Comunidade", "footer.shape": "Molde Elegon", "footer.world": "O mundo", "footer.vision": "A visão", "footer.feedback": "Quadro de feedback", "footer.rights": "Desenvolvido solo com paixão. Todos os direitos reservados.", "footer.london": "Forjado em Londres",
    "changelog.title": "Novidades e notas de atualização", "changelog.description": "Todas as notas de atualização de Elegon em um só lugar: as correções, melhorias e recursos mais recentes do playtest 24 horas por dia na Steam.", "changelog.today": "Hoje", "changelog.yesterday": "Ontem", "changelog.daysAgo": "dias atrás",
  },
  ru: {
    "nav.world": "Мир", "nav.features": "Особенности", "nav.devlogs": "Дневники разработки", "nav.vision": "Видение", "nav.faq": "Вопросы", "nav.changelog": "Список изменений", "nav.feedback": "Отзывы", "nav.roadmap": "План разработки", "nav.wishlist": "В желаемое", "nav.wishlistSteam": "Добавить в желаемое Steam", "nav.menu": "Меню", "nav.openMenu": "Открыть меню",
    "hero.live": "Открытый плейтест в Steam 24/7", "hero.tagline": "MMORPG, вдохновлённая классикой", "hero.description": "Окунитесь в мир, где ваш прогресс важен и приключения уже ждут.", "hero.community": "Присоединиться к сообществу", "hero.begin": "Начать путешествие", "hero.platforms": "Доступные платформы",
    "seo.title": "Elegon: инди-MMORPG, вдохновлённая классикой", "seo.description": "MMORPG от сольного разработчика, вдохновлённая классикой. Заслуженный прогресс, живой открытый мир и никакого pay-to-win. Присоединяйтесь к бесплатному плейтесту в Steam 24/7.",
    "footer.description": "MMORPG, вдохновлённая классикой и открыто создаваемая сольным разработчиком. Заслуженный прогресс, живой мир и никакого магазина за реальные деньги.", "footer.game": "Игра", "footer.community": "Сообщество", "footer.shape": "Создавайте Elegon", "footer.world": "Мир", "footer.vision": "Видение", "footer.feedback": "Доска отзывов", "footer.rights": "Создано в одиночку с любовью. Все права защищены.", "footer.london": "Создано в Лондоне",
    "changelog.title": "Список изменений и заметки к патчам", "changelog.description": "Все заметки к патчам Elegon в одном месте: последние исправления, улучшения и новинки открытого плейтеста Steam 24/7.", "changelog.today": "Сегодня", "changelog.yesterday": "Вчера", "changelog.daysAgo": "дней назад",
  },
  "zh-CN": {
    "nav.world": "世界", "nav.features": "特色", "nav.devlogs": "开发日志", "nav.vision": "愿景", "nav.faq": "常见问题", "nav.changelog": "更新日志", "nav.feedback": "反馈", "nav.roadmap": "路线图", "nav.wishlist": "加入愿望单", "nav.wishlistSteam": "加入 Steam 愿望单", "nav.menu": "菜单", "nav.openMenu": "打开菜单",
    "hero.live": "Steam 全天候开放测试现已开启", "hero.tagline": "一款致敬经典的 MMORPG", "hero.description": "踏入一个成长至关重要、冒险正在等待你的世界。", "hero.community": "加入社区", "hero.begin": "开始你的旅程", "hero.platforms": "支持的平台",
    "seo.title": "Elegon：一款致敬经典的独立 MMORPG", "seo.description": "由独立开发者打造、致敬经典的 MMORPG。努力终有回报，鲜活的开放世界，绝不付费取胜。现在即可在 Steam 加入全天候免费测试。",
    "footer.description": "一款由独立开发者公开打造、致敬经典的 MMORPG。努力终有回报，世界鲜活永续，绝不设现金商城。", "footer.game": "游戏", "footer.community": "社区", "footer.shape": "塑造 Elegon", "footer.world": "世界", "footer.vision": "愿景", "footer.feedback": "反馈板", "footer.rights": "独立开发，倾注热爱。保留所有权利。", "footer.london": "于伦敦铸就",
    "changelog.title": "更新日志与补丁说明", "changelog.description": "在这里查看 Elegon 的全部补丁说明：Steam 全天候开放测试中的最新修复、改进与新内容。", "changelog.today": "今天", "changelog.yesterday": "昨天", "changelog.daysAgo": "天前",
  },
} as const;

export function useLocale() {
  const route = useRoute();
  const locale = computed<SupportedLocale>(() => {
    const candidate = route.params.locale;
    return typeof candidate === "string" && SUPPORTED_LOCALES.includes(candidate as SupportedLocale)
      ? (candidate as SupportedLocale)
      : "en";
  });
  const t = (key: keyof typeof messages.en) => messages[locale.value][key] ?? messages.en[key];
  const localePath = (path = "/", target = locale.value) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return target === "en" ? normalized : `/${target}${normalized === "/" ? "" : normalized}`;
  };
  return { locale, t, localePath };
}
