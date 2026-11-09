import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import type {Card, EditSpec, Sub} from './types';

// Style tokens from the elliemomento edit guide.
export const C = {mint: '#8BEBFC', red: '#F85956', yellow: '#FBDB73', blue: '#0161C6', ink: '#111111'};
const SUB_Y = 1230; // ~64% of 1920
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
        color: style === 'mint' ? C.mint : C.red, textShadow: stroke(5, style === 'mint' ? '#0a2a33' : '#3a0b0a')}}>{sub.text}</div>
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
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <div style={{...line, color: '#fff', textShadow: stroke(4, 'rgba(0,0,0,.55)'), clipPath: `inset(0 ${reveal(0)}% 0 0)`}}>{spec.line1}</div>
      <div style={{...line, color: C.mint, textShadow: stroke(5, '#0a2a33'), clipPath: `inset(0 ${reveal(0.35 * fps)}% 0 0)`}}>{spec.line2}</div>
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

const TipBadge: React.FC<{n: number; total: number; label: string}> = ({n, total, label}) => (
  <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
    <span style={{background: C.blue, color: '#fff', fontFamily: 'PretendardB', fontSize: 34, padding: '8px 22px', borderRadius: 999}}>TIP {n}/{total}</span>
    <span style={{background: '#fff', color: C.ink, fontFamily: 'PretendardB', fontSize: 34, padding: '6px 20px', borderRadius: 999, border: '3px solid #1aa56a'}}>{label}</span>
  </div>
);

const InfoCard: React.FC<{card: Card}> = ({card}) => {
  const warn = card.kind === 'warn';
  return (
    <div style={{width: 820, background: '#fff', borderRadius: 22, boxShadow: '0 12px 36px rgba(0,0,0,.28)', padding: '26px 34px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative'}}>
      <div style={{fontFamily: 'PretendardB', fontSize: 38, color: warn ? '#C4302B' : C.ink}}>{warn ? '⚠️ ' : ''}{card.heading}</div>
      {card.rows.map((r, i) => (
        <div key={i} style={{display: 'flex', gap: 18, fontSize: 34, fontFamily: 'PretendardSB', color: '#333', alignItems: 'baseline'}}>
          {card.kind === 'check' ? <span style={{color: '#1aa56a'}}>✓</span> : null}
          <span style={{minWidth: r.length > 1 ? 210 : 0, color: r.length > 1 ? C.blue : '#333'}}>{r[0]}</span>
          {r[1] ? <span style={{background: i === card.rows.length - 1 && card.rows.length > 2 ? C.yellow : 'transparent'}}>{r[1]}</span> : null}
        </div>
      ))}
    </div>
  );
};

export const ElliEdit: React.FC<{spec: EditSpec}> = ({spec}) => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const zoomed = spec.zooms.some(([a, b]) => t >= a && t < b);
  const subIdx = spec.subs.findIndex((s, i) => t >= s.t && t < (spec.subs[i + 1]?.t ?? spec.duration));
  const sub = subIdx >= 0 ? spec.subs[subIdx] : null;
  const tip = spec.tips.find((x) => t >= x.start && t < x.end);
  const card = spec.cards.find((c) => t >= c.start && t < c.end);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoomed ? 1.15 : 1})`, transformOrigin: '50% 38%'}}>
        <OffthreadVideo src={staticFile(spec.video)} muted />
      </AbsoluteFill>
      {t < spec.title.end ? <Title spec={spec.title} f={f} fps={fps} /> : null}
      {tip ? <Pop key={`tip${tip.n}`} from={Math.round(tip.start * fps)}><TipBadge n={tip.n} total={spec.total} label={tip.label} /></Pop> : null}
      {card ? (
        <Pop key={card.start} from={Math.round(card.start * fps)} style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <InfoCard card={card} />
        </Pop>
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
