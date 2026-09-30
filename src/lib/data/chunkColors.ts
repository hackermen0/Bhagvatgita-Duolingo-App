/** Cycled per verse chunk so neighbouring pieces read as different — shared by the verse intro and the phrase screens. */
export const CHUNK_COLORS = ['--color-primary', '--color-info', '--color-success', '--color-accent'];
export const chunkColor = (i: number) => `var(${CHUNK_COLORS[i % CHUNK_COLORS.length]})`;
