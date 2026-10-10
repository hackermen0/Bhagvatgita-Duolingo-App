<script lang="ts" module>
  /** The text with its **bold** / *italic* markers removed, for reading aloud */
  export const plainText = (text: string): string => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
</script>

<script lang="ts">
  // A line of authored text with **bold** and *italic* spans (the philosophy content uses both). Rendered as text
  // nodes only, never as HTML.
  let { text } = $props<{ text: string }>();

  const parts = $derived(
    text
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .filter(Boolean)
      .map((p: string) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4
          ? { kind: 'bold' as const, text: p.slice(2, -2) }
          : p.startsWith('*') && p.endsWith('*') && p.length > 2
            ? { kind: 'italic' as const, text: p.slice(1, -1) }
            : { kind: 'plain' as const, text: p }
      )
  );
</script>

{#each parts as part}{#if part.kind === 'bold'}<strong class="font-black">{part.text}</strong>{:else if part.kind === 'italic'}<em>{part.text}</em>{:else}{part.text}{/if}{/each}
