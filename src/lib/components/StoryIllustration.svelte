<script lang="ts">
  import type { IllustrationKey } from '../data/stories';

  let { illustration }: { illustration: IllustrationKey } = $props();
</script>

<!--
  Flat-silhouette "temple mural" style, fixed poster palette (not theme-driven — this is
  full-bleed art, not chrome). Each scene shares the same horizon/ground language so the
  five read as one continuous story rather than five unrelated pictures.
-->
<svg viewBox="0 0 400 600" class="w-full h-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  {#if illustration === 'battlefield'}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3A1620" />
        <stop offset="55%" stop-color="#6B2A2E" />
        <stop offset="100%" stop-color="#C4622F" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#sky)" />
    <circle cx="200" cy="330" r="70" fill="#E8823A" opacity="0.55" />
    <path d="M0,420 Q120,380 260,410 T400,390 V600 H0 Z" fill="#2A1210" />
    <!-- distant opposing army -->
    <g fill="#1A0A08" opacity="0.8">
      <path d="M60,410 l-6,-22 l-6,22 Z" /><path d="M90,410 l-6,-26 l-6,26 Z" /><path d="M120,410 l-6,-20 l-6,20 Z" />
      <path d="M280,410 l-6,-24 l-6,24 Z" /><path d="M310,410 l-6,-20 l-6,20 Z" /><path d="M340,410 l-6,-26 l-6,26 Z" />
    </g>
    <!-- foreground chariot: two horses + Arjuna with lowered bow -->
    <g fill="#180907">
      <path d="M150,440 q10,-38 26,-40 q4,-16 14,-18 l3,10 q-8,4 -9,14 q14,4 18,32 Z" />
      <ellipse cx="176" cy="452" rx="34" ry="7" />
      <path d="M180,404 q34,-10 60,0 l-6,34 q-28,-10 -54,0 Z" />
      <path d="M212,362 q10,-6 10,14 l-3,30 h-10 l-3,-30 q0,-10 6,-14 Z" />
      <circle cx="217" cy="352" r="9" />
      <path d="M198,372 q-16,-4 -22,20 l6,2 q4,-16 16,-16 Z" />
      <path d="M188,388 q-4,18 -26,20" stroke="#180907" stroke-width="4" fill="none" stroke-linecap="round" />
    </g>
  {:else if illustration === 'teaching'}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#231449" />
        <stop offset="60%" stop-color="#4A2E6B" />
        <stop offset="100%" stop-color="#C98A2E" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#sky)" />
    <circle cx="235" cy="330" r="52" fill="#F2B01E" opacity="0.5" />
    <path d="M0,430 Q140,400 260,420 T400,405 V600 H0 Z" fill="#1C1130" />
    <!-- Krishna (radiant, hand raised) and Arjuna listening -->
    <g fill="#160C28">
      <circle cx="235" cy="360" r="34" fill="#F2B01E" opacity="0.25" />
      <path d="M235,340 q14,0 15,22 l-3,30 h-24 l-3,-30 q1,-22 15,-22 Z" />
      <circle cx="235" cy="330" r="10" />
      <path d="M251,352 q16,-10 18,-30 l6,2 q-2,24 -20,34 Z" />
      <path d="M170,414 q12,-4 20,20 l-4,2 q-8,-18 -18,-16 Z" />
      <path d="M172,368 q10,0 11,20 l-2,28 h-18 l-2,-28 q1,-20 11,-20 Z" />
      <circle cx="172" cy="360" r="9" />
    </g>
  {:else if illustration === 'balance'}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0E3A38" />
        <stop offset="60%" stop-color="#1B8A73" />
        <stop offset="100%" stop-color="#F2B01E" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#sky)" />
    <path d="M0,440 Q140,415 260,432 T400,418 V600 H0 Z" fill="#0C2624" />
    <!-- symmetric lotus / evenness glyph -->
    <g transform="translate(200,340)" fill="#F5EAD6" opacity="0.92">
      <path d="M0,-46 C16,-26 16,-6 0,0 C-16,-6 -16,-26 0,-46 Z" />
      <path d="M0,-46 C16,-26 16,-6 0,0 C-16,-6 -16,-26 0,-46 Z" transform="rotate(72)" />
      <path d="M0,-46 C16,-26 16,-6 0,0 C-16,-6 -16,-26 0,-46 Z" transform="rotate(144)" />
      <path d="M0,-46 C16,-26 16,-6 0,0 C-16,-6 -16,-26 0,-46 Z" transform="rotate(216)" />
      <path d="M0,-46 C16,-26 16,-6 0,0 C-16,-6 -16,-26 0,-46 Z" transform="rotate(288)" />
      <circle r="10" fill="#1B8A73" />
    </g>
    <g fill="#0C2624">
      <path d="M128,430 q9,0 10,18 l-2,26 h-16 l-2,-26 q1,-18 10,-18 Z" />
      <circle cx="128" cy="422" r="8" />
      <path d="M272,430 q9,0 10,18 l-2,26 h-16 l-2,-26 q1,-18 10,-18 Z" />
      <circle cx="272" cy="422" r="8" />
    </g>
  {:else if illustration === 'discipline'}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3A1E10" />
        <stop offset="55%" stop-color="#8C4A1E" />
        <stop offset="100%" stop-color="#F4972D" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#sky)" />
    <circle cx="290" cy="300" r="60" fill="#FFD98A" opacity="0.4" />
    <path d="M0,440 Q140,410 260,430 T400,412 V600 H0 Z" fill="#2A1408" />
    <!-- warrior at full draw: torso, drawn bow arc, taut string, and loosed arrow -->
    <g fill="#180B04">
      <path d="M198,344 q11,0 12,18 l-2,30 h-20 l-2,-30 q1,-18 12,-18 Z" />
      <circle cx="198" cy="334" r="10" />
      <path d="M210,352 q10,10 8,26" stroke="#180B04" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M188,358 q-20,4 -24,30" stroke="#180B04" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>
    <!-- bow (arc) and taut string meeting the drawing hand -->
    <path d="M218,300 Q252,336 218,392" stroke="#180B04" stroke-width="4" fill="none" stroke-linecap="round" />
    <path d="M218,300 L188,362 L218,392" stroke="#180B04" stroke-width="2" fill="none" opacity="0.85" />
    <path d="M188,362 L268,354" stroke="#FFE7A8" stroke-width="3" fill="none" stroke-linecap="round" />
    <g stroke="#FFE7A8" stroke-width="2" opacity="0.7" fill="none">
      <path d="M272,349 l14,-3" /><path d="M272,359 l14,6" />
    </g>
  {:else if illustration === 'peace'}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4A2A55" />
        <stop offset="45%" stop-color="#D9708A" />
        <stop offset="100%" stop-color="#F9CE72" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#sky)" />
    <circle cx="200" cy="380" r="90" fill="#FFE7A8" opacity="0.7" />
    <path d="M0,440 Q140,412 260,432 T400,416 V600 H0 Z" fill="#3A2038" />
    <path d="M0,600 H400 V470 Q200,486 0,470 Z" fill="#2A1730" opacity="0.9" />
    <!-- seated, peaceful figure -->
    <g fill="#20101E">
      <circle cx="200" cy="386" r="16" />
      <path d="M170,410 q30,-14 60,0 q6,26 -6,40 h-48 q-12,-14 -6,-40 Z" />
    </g>
    <g stroke="#20101E" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.85">
      <path d="M130,150 q10,-8 20,0" /><path d="M250,180 q10,-8 20,0" /><path d="M280,140 q10,-8 20,0" />
    </g>
  {/if}
</svg>
