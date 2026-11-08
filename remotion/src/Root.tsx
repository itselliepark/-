import {Composition} from 'remotion';
import {HelloTitle} from './HelloTitle';

export const Root: React.FC = () => (
  <Composition
    id="HelloTitle"
    component={HelloTitle}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{title: '영상 편집 준비 완료'}}
  />
);
