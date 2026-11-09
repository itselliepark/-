import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import type {Card, EditSpec, Sub} from './types';

// Style tokens from the elliemomento edit guide.
export const C = {mint: '#8BEBFC', red: '#F85956', yellow: '#FBDB73', blue: '#0161C6', ink: '#111111'};
const SUB_Y = 1230; // ~64% of 1920
const SAFE_TOP = 290; // keep top graphics below the Reels top UI dead zone (~15%)
const EMPH_SHADOW = '0 2px 10px rgba(0,0,0,.75), 0 0 4px rgba(0,0,0,.6)'; // emphasis text: no outline, dark blurred halo (matches VLLO shadow)
const FONTS: [string, string][] = [
  ['Anemone', 'fonts/Cafe24Anemone.ttf'],
  ['Kkubulim', 'fonts/BMkkubulim.ttf'],
  ['PretendardM', 'fonts/Pretendard-Medium.otf'],
  ['PretendardSB', 'fonts/Pretendard-SemiBold.otf'],
  ['PretendardB', 'fonts/Pretendard-Bold.otf'],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONTS.map(([name, file]) => new FontFace(name, `url(${staticFile(file)})`).load()
      .then((f) => document.fonts.add(f))))
      .then(() => continueRender(handle))
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
};

const stroke = (px: number, color: string) => {
  // Solid outline via stacked text-shadows (crisper than -webkit-text-stroke on rounded fonts).
  const s: string[] = [];
  for (let a = 0; a < 360; a += 30) {
    const r = (a * Math.PI) / 180;
    s.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  return s.join(',');
};

const Subtitle: React.FC<{sub: Sub; age: number}> = ({sub}) => {
  const style = sub.style ?? 'normal';
  const base: React.CSSProperties = {position: 'absolute', left: 40, right: 40, top: SUB_Y, textAlign: 'center', whiteSpace: 'nowrap'};
  const text =
    style === 'normal' ? (
      <div style={{...base, fontFamily: 'PretendardM', fontSize: 50, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.8)'}}>{sub.text}</div>
    ) : (
      <div style={{...base, top: SUB_Y - 8, fontFamily: style === 'mint' ? 'Anemone' : 'Kkubulim', fontSize: style === 'mint' ? 66 : 70,
        color: style === 'mint' ? C.mint : C.red, textShadow: EMPH_SHADOW}}>{sub.text}</div>
    );
  return (
    <>
      {sub.label ? (
        <div style={{position: 'absolute', top: SUB_Y - 70, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <span style={{background: '#fff', color: C.ink, fontFamily: 'PretendardSB', fontSize: 32, padding: '6px 16px', borderRadius: 6}}>{sub.label}</span>
        </div>
      ) : null}
      {text}
    </>
  );
};

const Title: React.FC<{spec: EditSpec['title']; f: number; fps: number}> = ({spec, f, fps}) => {
  const reveal = (start: number) => interpolate(f, [start, start + 0.5 * fps], [100, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line: React.CSSProperties = {fontFamily: 'Anemone', fontSize: 80, lineHeight: 1.15, textAlign: 'center', whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'absolute', top: SAFE_TOP, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <div style={{...line, color: '#fff', textShadow: EMPH_SHADOW, clipPath: `inset(0 ${reveal(0)}% 0 0)`}}>{spec.line1}</div>
      <div style={{...line, color: C.mint, textShadow: EMPH_SHADOW, clipPath: `inset(0 ${reveal(0.35 * fps)}% 0 0)`}}>{spec.line2}</div>
      {spec.label && f > 0.9 * fps ? (
        <span style={{marginTop: 10, background: '#fff', color: C.ink, fontFamily: 'PretendardSB', fontSize: 32, padding: '6px 16px', borderRadius: 6}}>{spec.label}</span>
      ) : null}
    </div>
  );
};

const Pop: React.FC<{from: number; children: React.ReactNode; style?: React.CSSProperties}> = ({from, children, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - from, fps, config: {damping: 14, stiffness: 220}});
  return <div style={{...style, transform: `scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.5)}}>{children}</div>;
};


// Card skins. 'solid' is the v3 look; the glass skins are frosted, rounded "Apple glass" variants.
export type Skin = 'solid' | 'glass' | 'glassDark' | 'glassMint' | 'glassPills';
type SkinDef = {surface: React.CSSProperties; heading: string; key: string; body: string; tip: React.CSSProperties; label: React.CSSProperties; pills?: boolean};
const GLASS_FX: React.CSSProperties = {backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)'};
const SKINS: Record<Skin, SkinDef> = {
  solid: {surface: {background: '#fff', borderRadius: 20, boxShadow: '0 12px 36px rgba(0,0,0,.28)'}, heading: C.ink, key: C.blue, body: '#333',
    tip: {background: C.blue, color: '#fff'}, label: {background: '#fff', color: C.ink}},
  glass: {surface: {...GLASS_FX, background: 'rgba(255,255,255,.30)', border: '1.5px solid rgba(255,255,255,.6)', borderRadius: 44,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.75), inset 0 -1px 0 rgba(255,255,255,.2), 0 18px 44px rgba(0,0,0,.18)'}, heading: '#111', key: C.blue, body: '#1d1d1f',
    tip: {...GLASS_FX, background: 'rgba(1,97,198,.72)', color: '#fff', border: '1.5px solid rgba(255,255,255,.45)'},
    label: {...GLASS_FX, background: 'rgba(255,255,255,.34)', color: '#111', border: '1.5px solid rgba(255,255,255,.6)'}},
  glassDark: {surface: {...GLASS_FX, background: 'rgba(24,24,28,.42)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 44,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 18px 44px rgba(0,0,0,.25)'}, heading: '#fff', key: C.mint, body: 'rgba(255,255,255,.88)',
    tip: {...GLASS_FX, background: 'rgba(1,97,198,.72)', color: '#fff', border: '1px solid rgba(255,255,255,.3)'},
    label: {...GLASS_FX, background: 'rgba(24,24,28,.45)', color: '#fff', border: '1px solid rgba(255,255,255,.22)'}},
  glassMint: {surface: {...GLASS_FX, background: 'linear-gradient(135deg, rgba(139,235,252,.42), rgba(255,255,255,.22))', border: '1.5px solid rgba(255,255,255,.6)', borderRadius: 44,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.7), 0 18px 44px rgba(10,85,102,.18)'}, heading: '#0b2f37', key: '#0161C6', body: '#12302f',
    tip: {...GLASS_FX, background: 'rgba(1,97,198,.72)', color: '#fff', border: '1.5px solid rgba(255,255,255,.45)'},
    label: {...GLASS_FX, background: 'rgba(139,235,252,.45)', color: '#0b2f37', border: '1.5px solid rgba(255,255,255,.6)'}},
  glassPills: {surface: {...GLASS_FX, background: 'rgba(255,255,255,.32)', border: '1.5px solid rgba(255,255,255,.6)', borderRadius: 999,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.75), 0 12px 30px rgba(0,0,0,.16)'}, heading: '#111', key: C.blue, body: '#1d1d1f', pills: true,
    tip: {...GLASS_FX, background: 'rgba(1,97,198,.72)', color: '#fff', border: '1.5px solid rgba(255,255,255,.45)'},
    label: {...GLASS_FX, background: 'rgba(255,255,255,.34)', color: '#111', border: '1.5px solid rgba(255,255,255,.6)'}},
};

const TipBadge: React.FC<{n: number; total: number; label: string; skin: SkinDef}> = ({n, total, label, skin}) => (
  <div style={{position: 'absolute', top: SAFE_TOP, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
    <span style={{...skin.tip, fontFamily: 'PretendardB', fontSize: 34, padding: '8px 22px', borderRadius: 999}}>TIP {n}/{total}</span>
    <span style={{...skin.label, fontFamily: 'PretendardB', fontSize: 34, padding: '8px 22px', borderRadius: 999}}>{label}</span>
  </div>
);

const InfoCard: React.FC<{card: Card; t: number; skin: SkinDef}> = ({card, t, skin}) => {
  const warn = card.kind === 'warn';
  const head = <div style={{fontFamily: 'PretendardB', fontSize: 35, color: warn ? '#E5484D' : skin.heading}}>{warn ? '⚠️ ' : ''}{card.heading}</div>;
  const rows = card.rows.map((r, i) => (t < (card.rowTimes?.[i] ?? 0) ? null :
    <div key={i} style={{display: 'flex', gap: 18, fontSize: 31, fontFamily: 'PretendardSB', color: skin.body, alignItems: 'baseline',
      ...(skin.pills ? {...skin.surface, padding: '14px 30px', alignSelf: 'center'} : {})}}>
      {card.kind === 'check' ? <span style={{color: '#1aa56a'}}>✓</span> : null}
      <span style={{minWidth: r.length > 1 && !skin.pills ? 210 : 0, color: r.length > 1 ? skin.key : skin.body, fontFamily: r.length > 1 ? 'PretendardB' : 'PretendardSB'}}>{r[0]}</span>
      {r[1] ? <span style={{background: i === card.rows.length - 1 && card.rows.length > 2 ? C.yellow : 'transparent', color: i === card.rows.length - 1 && card.rows.length > 2 ? C.ink : skin.body, borderRadius: 6, padding: '0 4px'}}>{r[1]}</span> : null}
    </div>
  ));
  if (skin.pills) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <div style={{...skin.surface, padding: '14px 34px'}}>{head}</div>
        {rows}
      </div>
    );
  }
  return (
    <div style={{...skin.surface, width: 780, padding: '24px 36px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative'}}>
      {head}
      {rows}
    </div>
  );
};

export const ElliEdit: React.FC<{spec: EditSpec; skin?: Skin}> = ({spec, skin: skinName = 'solid'}) => {
  useFonts();
  const skin = SKINS[skinName] ?? SKINS.solid;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const zoomed = spec.zooms.some(([a, b]) => t >= a && t < b);
  const subIdx = spec.subs.findIndex((s, i) => t >= s.t && t < (spec.subs[i + 1]?.t ?? spec.duration));
  const sub = subIdx >= 0 ? spec.subs[subIdx] : null;
  const tip = spec.tips.find((x) => t >= x.start && t < x.end);
  const card = spec.cards.find((c) => t >= c.start && t < c.end);
  const tiles = (spec.tiles ?? []).filter((x) => t >= x.start && t < x.end);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoomed ? 1.15 : 1})`, transformOrigin: '50% 38%'}}>
        <OffthreadVideo src={staticFile(spec.video)} muted />
      </AbsoluteFill>
      {t < spec.title.end ? <Title spec={spec.title} f={f} fps={fps} /> : null}
      {tip ? <Pop key={`tip${tip.n}`} from={Math.round(tip.start * fps)}><TipBadge n={tip.n} total={spec.total} label={tip.label} skin={skin} /></Pop> : null}
      {card ? (
        <Pop key={card.start} from={Math.round(card.start * fps)} style={{position: 'absolute', top: SAFE_TOP + 80, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <InfoCard card={card} t={t} skin={skin} />
        </Pop>
      ) : null}
      {tiles.length ? (
        <div style={{position: 'absolute', top: SAFE_TOP + 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 24}}>
          {tiles.map((x) => (
            <Pop key={x.title} from={Math.round(x.start * fps)}>
              <div style={{...skin.surface, borderRadius: skin.pills ? 48 : skin.surface.borderRadius, width: 380, padding: '22px 30px', display: 'flex', flexDirection: 'column', gap: 6}}>
                <div style={{fontFamily: 'PretendardB', fontSize: 44, color: skin.key}}>{x.title}</div>
                <div style={{fontFamily: 'PretendardSB', fontSize: 30, color: skin.body, lineHeight: 1.3, whiteSpace: 'pre-line'}}>{x.body}</div>
              </div>
            </Pop>
          ))}
        </div>
      ) : null}
      {spec.cta && t >= spec.cta.start ? (
        <Pop from={Math.round(spec.cta.start * fps)} style={{position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{background: C.mint, color: C.ink, fontFamily: 'PretendardB', fontSize: 46, lineHeight: 1.35, textAlign: 'center', padding: '20px 40px', borderRadius: 8, whiteSpace: 'pre-line'}}>{spec.cta.text}</div>
        </Pop>
      ) : null}
      {sub ? <Subtitle sub={sub} age={t - sub.t} /> : null}
    </AbsoluteFill>
  );
};
