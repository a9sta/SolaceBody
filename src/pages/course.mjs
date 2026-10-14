import { layout, stack } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepList, stepSet, noticeBlock, longtail, callBand, courseGrid, topicLinks, courseTopic } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 7 이면 팔천 쪽이 넘는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 씁니다. 마친 뒤 씻을 수 있는 시각인지만 가늠해 보고 고르십시오.',
  false: '기름이 들어가지 않습니다. 옷을 입은 채 받고 끝나면 바로 움직이셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 하면서 맞춥니다. 십 분쯤 가면 어느 선이 맞는지 양쪽이 알게 됩니다.',
  '표에 적힌 등급은 시작 지점일 뿐입니다. 아프시면 참지 마시고 바로 말씀해 주십시오.',
  '같은 힘도 사람에 따라 전혀 다르게 받아들입니다. 글자보다 그날 몸이 먼저입니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분은 대개 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 맞춰 둔 코스입니다. 사정이 다르면 통화에서 갈아 드립니다.`,
  (c) => `${c.for} 이쪽이 낫습니다. 정하신 뒤에 바꾸셔도 되고, 값은 마지막에 받으신 코스로 셉니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lede = `<div class="lede">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = stack('fact', 'course', `${esc(c.ko)} 한눈에 보기`,
    factTable([
      ['기본 시간', `${c.min}분`],
      ['값', `${won(c.price)}원 — 지역을 가리지 않음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['주로 다루는 자리', esc(c.focus)],
      ['기름', c.oil ? '바릅니다' : '안 바릅니다'],
      ['준비물', c.oil ? '수건 두 장 · 몸을 펼 자리 하나' : '몸을 펼 자리 하나 — 수건은 한 장이면 됩니다'],
      ['여는 시각', `${esc(cfg.hours)} 접수 · ${esc(cfg.pay)} · 도착 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = stack('cmp', 'compare', '다른 코스와 견주면',
    `<table class="versus"><thead><tr><th scope="col">코스</th><th scope="col">시간</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="here"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '시간이 길다고 손이 센 것은 아닙니다. 두 가지는 따로 보셔야 합니다.', '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '03');

  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${c.ko}${josa(c.ko, '을/를')} 지역에서`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '다른 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구로 바로', items: guList, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '05', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    lede,
    facts,
    callBand(cfg, c.ko, seed),
    compare,
    stepList(seed, '02'),
    faqHtml,
    noticeBlock(seed, '04'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="title-u">${c.min}분 ${won(c.price)}원 : 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = [
    `${sd.name} 안에서는 ${c.ko} 값이 한 가지입니다 — ${c.min}분에 ${won(c.price)}원. 멀고 가까움으로 숫자를 고치지 않습니다.`,
    `${sd.name} 어느 자리에서 부르셔도 ${c.ko}에 들어가는 내용이 같습니다. 바뀌는 것은 닿는 데 걸리는 시간뿐입니다.`,
    `${sd.name} 쪽 ${c.ko} 문의도 같은 번호로 들어옵니다. ${c.min}분 ${won(c.price)}원입니다.`,
  ];
  const second = sd.main
    ? `${sd.name}에는 동 ${sd.spotCount}칸에 쪽이 있습니다. 사시는 칸을 누르면 그 자리에서 해가 뜨고 지는 시각이 함께 뜨는데, 저녁 방문을 몇 시로 잡을지 가늠하실 때 쓰시면 됩니다.`
    : `${sd.name}에서는 시군구 ${sd.gu.length}곳이 가장 아래 층입니다. 동 이름은 그 안에 목록으로 들어 있으니 전화로 그대로 불러 주시면 됩니다.`;

  const lede = `<div class="lede">
  <p>${esc(at(h, open, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = stack('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 한눈에 보기`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 낸 단위', sd.main ? `시군구 ${sd.gu.length} → 동 ${sd.spotCount}` : `시군구 ${sd.gu.length}`],
      ['기본 시간', `${c.min}분`],
      ['값', `${won(c.price)}원 — ${esc(sd.name)} 전역 같은 값`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['주로 다루는 자리', esc(c.focus)],
      ['기름', c.oil ? '바릅니다' : '안 바릅니다'],
      ['하짓날 해넘이', `${sd.sunset} — 그 뒤 방문은 들어오는 길을 한 번 더 여쭙습니다`],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '02');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const guHere = sd.gu.map((g) => ({ label: `${g.name}`, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug)
    .map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug)
    .map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} 다른 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko}${josa(c.ko, '을/를')} 다른 지역에서`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: `${sd.name} 시군구`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동으로 바로`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '04', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    lede,
    facts,
    callBand(cfg, `${sd.name} ${c.ko}`, seed),
    courseGrid(courses, seed, sd.name, '01', { full: false }),
    faqHtml,
    stepList(seed, '03'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="title-u">출장마사지 홈타이 : ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 곳', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
