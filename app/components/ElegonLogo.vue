<script setup lang="ts">
// Elegon logotype. Letterforms are Cinzel (SIL OFL) outlines generated as paths so the
// logo never shifts while web fonts load; the "O" is a custom crescent-moon emblem.
const id = useId();
</script>

<template>
  <svg class="elegon-logo" viewBox="-40 -210 4384 1120" role="img" aria-label="Elegon">
    <defs>
      <linearGradient :id="`${id}-gold`" x1="0" y1="-120" x2="0" y2="820" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff6de" />
        <stop offset="0.45" stop-color="#f1d59a" />
        <stop offset="0.8" stop-color="#d9ab5f" />
        <stop offset="1" stop-color="#b8843d" />
      </linearGradient>
      <radialGradient :id="`${id}-moonlight`" cx="0" cy="0" r="420" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffe7b0" stop-opacity="0.35" />
        <stop offset="0.7" stop-color="#ffcf7a" stop-opacity="0.08" />
        <stop offset="1" stop-color="#ffcf7a" stop-opacity="0" />
      </radialGradient>
      <mask :id="`${id}-crescent`" maskUnits="userSpaceOnUse" x="-400" y="-400" width="800" height="800">
        <circle r="290" fill="#fff" />
        <circle cx="108" cy="-84" r="262" fill="#000" />
      </mask>
      <filter :id="`${id}-glow`" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
    </defs>

    <g :fill="`url(#${id}-gold)`" :stroke="`url(#${id}-gold)`" stroke-width="15" stroke-linejoin="miter">
    <path class="logo-letter" transform="translate(-60 700) scale(1 -1)" d="M202 700L202 0L137 0L137 700ZM472 31L472 0L199 0L199 31ZM429 360L429 330L199 330L199 360ZM472 700L472 669L199 669L199 700ZM533 162L475 0L309 0L345 31Q398 31 432 48Q465 64 486 94Q507 124 523 162ZM429 332L429 266L419 266L419 281Q419 301 405 316Q391 330 371 330L371 332ZM429 424L429 358L371 358L371 360Q391 361 405 376Q419 390 419 410L419 424ZM472 672L472 592L462 592L462 610Q462 634 445 652Q428 669 403 670L403 672ZM472 718L472 689L350 700Q372 700 397 703Q421 706 442 710Q463 714 472 718ZM140 73L140 0L60 0L60 10Q60 10 67 10Q73 10 73 10Q99 10 118 29Q136 47 137 73ZM140 627L137 627Q137 653 118 672Q99 690 73 690Q73 690 67 690Q61 690 61 690L60 700L140 700Z" />
    <path class="logo-letter" transform="translate(543 700) scale(1 -1)" d="M202 700L202 0L137 0L137 700ZM472 31L472 0L199 0L199 31ZM533 162L475 0L309 0L345 31Q398 31 432 48Q465 64 486 94Q507 124 523 162ZM140 73L140 0L60 0L60 10Q60 10 67 10Q73 10 73 10Q99 10 118 29Q136 47 137 73ZM140 627L137 627Q136 653 118 672Q99 690 73 690Q73 690 67 690Q60 690 60 690L60 700L140 700ZM199 627L199 700L279 700L279 690Q278 690 272 690Q266 690 266 690Q240 690 222 672Q203 653 202 627Z" />
    <path class="logo-letter" transform="translate(1096 700) scale(1 -1)" d="M202 700L202 0L137 0L137 700ZM472 31L472 0L199 0L199 31ZM429 360L429 330L199 330L199 360ZM472 700L472 669L199 669L199 700ZM533 162L475 0L309 0L345 31Q398 31 432 48Q465 64 486 94Q507 124 523 162ZM429 332L429 266L419 266L419 281Q419 301 405 316Q391 330 371 330L371 332ZM429 424L429 358L371 358L371 360Q391 361 405 376Q419 390 419 410L419 424ZM472 672L472 592L462 592L462 610Q462 634 445 652Q428 669 403 670L403 672ZM472 718L472 689L350 700Q372 700 397 703Q421 706 442 710Q463 714 472 718ZM140 73L140 0L60 0L60 10Q60 10 67 10Q73 10 73 10Q99 10 118 29Q136 47 137 73ZM140 627L137 627Q137 653 118 672Q99 690 73 690Q73 690 67 690Q61 690 61 690L60 700L140 700Z" />
    <path class="logo-letter" transform="translate(1669 700) scale(1 -1)" d="M709 280L709 115Q686 85 647 55Q608 25 552 6Q495 -14 419 -14Q313 -13 232 33Q151 78 106 160Q60 241 60 350Q60 459 106 541Q151 623 232 669Q313 714 419 714Q474 714 518 705Q562 696 598 681Q633 665 662 646L682 505L673 505Q658 563 624 603Q589 642 537 663Q485 684 419 684Q335 684 271 642Q207 600 171 525Q135 450 135 350Q135 250 171 175Q207 100 271 59Q335 17 419 16Q463 16 504 27Q544 37 580 57Q616 76 644 103L645 280Q645 325 594 325L578 325L578 335L774 335L774 325L759 325Q707 325 709 280Z" />
    <path class="logo-letter" transform="translate(3508 700) scale(1 -1)" d="M126 715L707 95L716 -14L135 605ZM128 71L128 0L45 0L45 10Q45 10 54 10Q63 10 64 10Q89 10 107 28Q125 46 125 71ZM171 71Q171 46 189 28Q207 10 232 10Q233 10 242 10Q251 10 251 10L251 0L168 0L168 71ZM126 715L170 659L171 0L125 0L125 590Q125 641 121 678Q116 715 116 715ZM716 700L716 114Q716 82 718 53Q720 23 723 5Q725 -14 725 -14L716 -14L671 39L671 700ZM796 700L796 690Q796 690 787 690Q778 690 778 690Q753 690 735 673Q717 655 716 629L713 629L713 700ZM590 700L673 700L673 629L671 629Q670 655 653 673Q635 690 609 690Q609 690 600 690Q591 690 590 690Z" />
    </g>

    <g class="logo-emblem" transform="translate(2998 350)">
      <circle class="logo-moonlight" r="400" :fill="`url(#${id}-moonlight)`" />

      <g fill="none" :stroke="`url(#${id}-gold)`">
        <circle class="logo-ring" r="420" stroke-width="32" />
        <circle class="logo-ring logo-ring--inner" r="374" stroke-width="7" />
        <circle
          class="logo-orbit"
          r="472"
          stroke-width="9"
          stroke-linecap="round"
          stroke-dasharray="0 40"
        />
      </g>

      <g class="logo-points" :fill="`url(#${id}-gold)`">
        <path d="M-30 -414 0 -570 30 -414Z" />
        <path d="M-30 414 0 570 30 414Z" />
        <path d="M-464 0-420 -30-376 0-420 30Z" />
        <path d="M464 0 420 -30 376 0 420 30Z" />
      </g>

      <g class="logo-moon">
        <g :mask="`url(#${id}-crescent)`">
          <circle r="290" fill="#ffd98e" :filter="`url(#${id}-glow)`" opacity="0.55" />
          <circle r="290" :fill="`url(#${id}-gold)`" />
        </g>
        <path
          class="logo-star"
          transform="translate(118 -92)"
          fill="#fff8e6"
          d="M0-92C7-22 18-11 92 0 18 11 7 22 0 92-7 22-18 11-92 0-18-11-7-22 0-92Z"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.elegon-logo {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 0.4rem 1.2rem rgba(8, 5, 2, 0.75)) drop-shadow(0 0 2.5rem rgba(8, 5, 2, 0.45));
}

.logo-orbit {
  transform-box: fill-box;
  transform-origin: center;
}

.logo-orbit {
  opacity: 0.55;
  animation: logo-spin 140s linear infinite;
}

.logo-moonlight {
  animation: logo-breathe 7s ease-in-out infinite;
}

.logo-star {
  transform-box: fill-box;
  transform-origin: center;
  animation: logo-twinkle 6s ease-in-out infinite;
}

@keyframes logo-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes logo-breathe {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes logo-twinkle {
  0%,
  78%,
  100% {
    scale: 1;
    opacity: 1;
  }
  86% {
    scale: 1.35;
    opacity: 0.75;
  }
}
</style>
