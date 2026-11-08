import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const HelloTitle: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#111', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{color: 'white', fontSize: 96, fontWeight: 800, transform: `scale(${scale})`, opacity, textAlign: 'center', padding: 60}}>
        {title}
      </div>
    </AbsoluteFill>
  );
};
