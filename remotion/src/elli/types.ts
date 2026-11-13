export type SubStyle = 'normal' | 'mint' | 'red' | 'yellow';
export type Sub = {t: number; text: string; style?: SubStyle; label?: string};
export type Card = {start: number; end: number; kind: 'table' | 'warn' | 'check'; heading: string; rows: string[][]; rowTimes?: number[]; plain?: boolean; note?: string; alpha?: number};
export type Sfx = {t: number; kind: 'pop' | 'whoosh' | 'ding' | 'buzz' | 'thud'};

export type EditSpec = {
  video: string;
  duration: number;
  title?: {line1: string; line2: string; label?: string; end: number};
  subs: Sub[];
  zooms: [number, number][];
  // Optional framing schedule [start s, scale]; when present it replaces `zooms`.
  framing?: [number, number][];
  tips: {start: number; end: number; n: number; label: string}[];
  total: number;
  cards: Card[];
  // White opacity for cards and tiles (overrides the skin); a card's own `alpha` wins.
  cardAlpha?: number;
  // Term tiles: each pops in when its term is spoken and sits side by side with the others.
  tiles?: {start: number; end: number; title: string; body: string}[];
  // Icon row: each icon pops in at its own start, left to right.
  icons?: {start: number; end: number; kind: 'youtube' | 'instagram' | 'emoji'; emoji?: string; label: string}[];
  // Casual speech-bubble notes (emoji welcome), stacked and slightly tilted.
  bubbles?: {start: number; end: number; text: string}[];
  cta?: {start: number; text: string};
  sfx: Sfx[];
};
