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
    {t: 10.52, text: '문제는', style: 'red'},
    {t: 10.96, text: '일단 자료가 중구난방으로'},
    {t: 12.4, text: '너무 많고'},
    {t: 12.76, text: '가르쳐주는 데마다'},
    {t: 13.54, text: '스킬이 다 달라서', style: 'red'},
    {t: 14.54, text: '뭘 따라야 될지', style: 'red'},
    {t: 15.21, text: '모르겠는 거예요', style: 'red'},
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
  cards: [],
  icons: [
    {start: 8.15, end: 10.52, kind: 'youtube', label: '유튜브'},
    {start: 8.75, end: 10.52, kind: 'instagram', label: '인스타'},
    {start: 9.05, end: 10.52, kind: 'emoji', emoji: '💳', label: '유료 강의'},
  ],
  bubbles: [
    {start: 10.96, end: 16.06, text: '자료가 너무 많아 🤯'},
    {start: 12.76, end: 16.06, text: '스킬이 다 달라 🤷‍♀️'},
  ],
  sfx: [],
};
