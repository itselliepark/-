export type SubStyle = 'normal' | 'mint' | 'red';
export type Sub = {t: number; text: string; style?: SubStyle; label?: string};
export type Card = {start: number; end: number; kind: 'table' | 'warn' | 'check'; heading: string; rows: string[][]; rowTimes?: number[]};
export type Sfx = {t: number; kind: 'pop' | 'whoosh' | 'ding' | 'buzz' | 'thud'};

export type EditSpec = {
  video: string;
  duration: number;
  title: {line1: string; line2: string; label?: string; end: number};
  subs: Sub[];
  zooms: [number, number][];
  tips: {start: number; end: number; n: number; label: string}[];
  total: number;
  cards: Card[];
  // Term tiles: each pops in when its term is spoken and sits side by side with the others.
  tiles?: {start: number; end: number; title: string; body: string}[];
  cta?: {start: number; text: string};
  sfx: Sfx[];
};
