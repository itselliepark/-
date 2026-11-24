import {Composition} from 'remotion';
import {HelloTitle} from './HelloTitle';
import {ElliEdit} from './elli/ElliEdit';
import {layoff} from './elli/layoff';
import {celpip} from './elli/celpip';
import {mala} from './elli/mala';

export const Root: React.FC = () => (
  <>
    <Composition
      id="HelloTitle"
      component={HelloTitle}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{title: '영상 편집 준비 완료'}}
    />
    <Composition
      id="Layoff"
      component={ElliEdit}
      durationInFrames={Math.round(layoff.duration * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{spec: layoff, skin: 'frost80' as const}}
    />
    <Composition
      id="Celpip"
      component={ElliEdit}
      durationInFrames={Math.round(celpip.duration * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{spec: celpip, skin: 'frost80' as const}}
    />
    <Composition
      id="Mala"
      component={ElliEdit}
      durationInFrames={Math.round(mala.duration * 30)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{spec: mala, skin: 'frost80' as const}}
    />
  </>
);
