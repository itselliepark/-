import type {EditSpec} from './types';

// 셀핍 6주 만에 CLB 10 + 가이드 CTA (경험담형, 28.9s). Times from whisper word timestamps.
// Cards marked PLACEHOLDER stand in for real captures Elli will supply.
export const celpip: EditSpec = {
  video: 'media/celpip.mp4',
  duration: 28.9,
  subs: [
    {t: 0.0, text: '저 캐나다에서'},
    {t: 1.12, text: '풀타임 직장인으로 일하면서'},
    {t: 2.88, text: '6주 만에', style: 'mint'},
    {t: 3.25, text: '셀핍 CLB 10 받았어요', style: 'mint'},
    {t: 4.58, text: '근데 처음 모의고사 쳤을 땐'},
    {t: 5.68, text: '리스닝 6, 리딩 7', style: 'red'},
    {t: 7.0, text: '이렇게 나오는 거예요'},
    {t: 7.92, text: '그래서 유튜브, 인스타,'},
    {t: 9.05, text: '유료 강의까지 다 뒤져봤는데'},
    {t: 10.52, text: '문제는', style: 'yellow'},
    {t: 10.96, text: '일단 자료가 중구난방으로'},
    {t: 12.4, text: '너무 많고'},
    {t: 12.76, text: '가르쳐주는 데마다'},
    {t: 13.54, text: '스킬이 다 달라서', style: 'red'},
    {t: 14.54, text: '뭘 따라야 될지'},
    {t: 15.21, text: '모르겠는 거예요'},
    {t: 16.06, text: '그래서 제가'},
    {t: 16.47, text: '유료, 무료 강의에서'},
    {t: 17.46, text: '진짜 딱 필요한 핵심만 뽑아서', style: 'mint'},
    {t: 18.94, text: '가이드 하나로 정리했어요', style: 'mint'},
    {t: 19.86, text: '이 가이드 참고해서'},
    {t: 20.5, text: '제 남자친구는'},
    {t: 20.98, text: '셀핍 노베이스에서'},
    {t: 22.26, text: '1주 만에 셀핍 10 받고', style: 'mint'},
    {t: 23.62, text: '제 팔로워분도'},
    {t: 24.22, text: '셀핍 9 받으셨대요', style: 'mint'},
    {t: 25.3, text: '6주 만에 CLB 10 찍고'},
    {t: 26.7, text: '만든 가이드 필요하신 분은'},
    {t: 27.56, text: "댓글에 '셀핍' 남겨주세요", style: 'mint'},
  ],
  // Punch-ins only on lines that need emphasis.
  zooms: [[2.88, 4.58], [5.68, 7.0], [10.52, 10.96], [17.46, 19.86], [22.26, 23.62], [27.56, 28.9]],
  tips: [],
  total: 0,
  cardAlpha: 0.66,
  cards: [
    // PLACEHOLDER: real CELPIP score report capture
    {start: 2.88, end: 4.58, kind: 'table', heading: '내 셀핍 결과', rows: [['준비 기간', '6주 (풀타임 근무 병행)'], ['점수', 'CLB 10']]},
    {start: 10.96, end: 16.06, kind: 'table', heading: '혼자 준비할 때 문제', plain: true,
      rows: [['자료가 중구난방으로 너무 많음'], ['가르쳐주는 데마다 스킬이 다름']], rowTimes: [10.96, 12.76]},
    // PLACEHOLDER: real page capture of the study guide
    {start: 16.47, end: 19.86, kind: 'check', heading: 'CELPIP 스터디 가이드', rows: [['유료 · 무료 강의에서 핵심만'], ['가이드 하나로 정리']], rowTimes: [17.46, 18.94]},
  ],
  tiles: [
    // PLACEHOLDER: first mock-test result capture
    {start: 5.68, end: 7.92, title: '리스닝 6', body: '첫 모의고사'},
    {start: 6.42, end: 7.92, title: '리딩 7', body: '첫 모의고사'},
    // PLACEHOLDER: boyfriend's score report / follower DM capture
    {start: 20.5, end: 25.3, title: '남자친구', body: '노베이스 → 1주 만에\n셀핍 10'},
    {start: 23.62, end: 25.3, title: '팔로워', body: '셀핍 9'},
  ],
  sfx: [],
};
