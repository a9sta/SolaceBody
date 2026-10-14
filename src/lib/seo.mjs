/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 아홉 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *   ★**쌍점(:)** 으로 가르는 모양은 여기서 처음 쓴다. 아홉 곳 모두 쌍점을 쓰지 않는다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (남중 시각·해돋이·낮 길이·북에서 몇째)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '솔레이스바디';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '림프', '건식', '종아리'];
/** 제목 꼬리 행동어 */
const ACT = ['해 지기 전에', '도착 시각 안내', '야간 접수', '오늘 방문', '통화로 확정'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} : 서울 인천 경기 부산 동 방문 관리 24시 야간 접수`,
  areaHub: (c) => `${KEY} 가는 곳 : 동 ${c.spot}칸 시군구 ${c.gu}곳 전체 목록 | ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} : ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} 방문 ${at(hash(sd.name, 'sdt'), ACT)} | ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}칸` : g.main ? `읍면 ${g.ruralCount}칸` : `행정동 ${g.dongCount}칸`;
    return `${g.name} ${KEY} : ${sd.name} ${unit} ${at(h, ACT, 0)} | ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} : ${g.name} ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} | ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} : ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} | ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} : ${sd.name} 방문 ${at(hash(sd.name, c.slug), ACT)} | ${BRAND}`,
  page: (t) => `${t} | ${BRAND} ${KEY}`,
  post: (p) => `${p.title} | ${BRAND} 해그림자 일지`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 해의 자리에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `하짓날 해가 ${s.riseS.slice(0, 5)}에 떠서 ${s.setS.slice(0, 5)}에 집니다`,
    () => `해가 가장 높이 오르는 때가 ${s.noon.slice(0, 5)}, 시계보다 ${Math.round(s.noonLate)}분 늦습니다`,
    () => `여름 낮이 ${s.daySum}, 겨울 낮이 ${s.dayWin}입니다`,
    () => `쪽을 낸 칸을 북에서부터 세면 ${s.nsRank}번째 자리입니다`,
    () => `동에서 ${s.ewRank}번째라 해가 ${s.setRank > 600 ? '일찍' : '늦게'} 집니다`,
    () => `땅 ${km2(s.area)}에 남중 ${s.noon.slice(0, 5)}, 해넘이 ${s.setS.slice(0, 5)}`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '값은 마친 뒤에 치릅니다',
  '어두워져도 요금이 같습니다',
  '미리 보내실 돈이 없습니다',
  '거리로 값을 올리지 않습니다',
  '새벽에도 표 그대로입니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 해가 지는 시각을 칸마다 계산해 두었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이로 가는 동 ${c.spot}칸과 시군구 ${c.gu}곳. 칸마다 해가 뜨고 지는 시각을 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}칸에 쪽을 냈습니다. 하짓날 해넘이는 ${sd.sunset.slice(0, 5)}입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}칸에 쪽을 냈고 하짓날 해넘이가 ${g.sunset.slice(0, 5)}`,
        `남북으로 ${g.nsKm}km 벌어져 있고 남중은 ${g.noon.slice(0, 5)}`,
        `가장 북쪽이 ${g.topSpot}, 가장 남쪽이 ${g.botSpot}`,
        `해돋이가 가장 이른 칸과 늦은 칸이 ${g.riseSpread}초 차이`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}칸이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}칸과 면 ${g.myeonCount}칸을 이름으로 올려 두었습니다`,
          `땅 ${km2(g.area)}에 하짓날 해넘이가 ${g.sunset.slice(0, 5)}`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
        `행정동 ${g.dongCount}칸이 들어 있고 땅은 ${km2(g.area)}`,
        `남북 ${g.nsKm}km · 동서 ${g.ewKm}km 안쪽`,
        g.ruralCount ? `동과 읍·면 ${g.ruralCount}칸 모두 받습니다` : `동 ${g.dongNames.length}칸 어디나 같은 번호`,
      ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY} 방문. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY} 방문. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}${josa(c.focus, '을/를')} 주로 다루고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY} 방문. ${c.focus}에 시간을 씁니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원입니다.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
