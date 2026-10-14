import { layout, stack } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  sunKin, spotIndex, ruralList, dongNameList, guIndex, nearList, callBand,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  noonWord, dayWord, duskWord, northWord, spanWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const hourMin = (m) => `${Math.floor(m / 60)}시간 ${m % 60}분`;

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 좌표에서 계산해 나온 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name,
    lat: s.lat, lng: s.lng, area: km2(s.area),
    noon: s.noon, noonLate: Math.round(s.noonLate),
    riseS: s.riseS, setS: s.setS, daySum: s.daySum,
    riseW: s.riseW, setW: s.setW, dayWin: s.dayWin,
    riseE: s.riseE, gapHour: hourMin(s.gapMin),
    nsRank: s.nsRank, ewRank: s.ewRank, riseRank: s.riseRank, setRank: s.setRank,
    guNsRank: s.guNsRank, guEwRank: s.guEwRank,
    band: (Math.round(s.lat / 0.02) * 0.02).toFixed(2), bandN: s.bandN - 1,
    allSpots: counts.spot,
    topSpot: g.topSpot, botSpot: g.botSpot, guNsKm: g.nsKm, riseSpread: g.riseSpread,
    guSpotCount: g.spotCount,
    noonNote: noonWord(s.noonLate), dayNote: dayWord(s.daySumMin),
    duskNote: duskWord(s.setS), northNote: northWord(s.nsRank, counts.spot),
    spanNote: spanWord(s.area),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 쪽 — 메인 네 시도에서만 낸다 ──────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const lede = `<div class="lede">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = stack('fact', 'counted', `${esc(s.name)} 위에 뜬 해`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['복판 좌표', `북위 ${s.lat} · 동경 ${s.lng}`],
      ['남중(해의 정오)', `${s.noon} — 시계보다 ${Math.round(s.noonLate)}분 늦음`],
      ['하짓날', `해돋이 ${s.riseS} · 해넘이 ${s.setS} · 낮 ${s.daySum}`],
      ['동짓날', `해돋이 ${s.riseW} · 해넘이 ${s.setW} · 낮 ${s.dayWin}`],
      ['여름과 겨울의 낮 차이', `${hourMin(s.gapMin)}`],
      ['쪽을 낸 칸 중 차례', `북에서 ${s.nsRank}번째 · 동에서 ${s.ewRank}번째`],
      ['땅', `${km2(s.area)} — ${esc(spanWord(s.area))}`],
      ['여는 시각', `${esc(cfg.hours)} 접수 · ${esc(cfg.pay)} · 도착 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lede,
    facts,
    callBand(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    sunKin(sd, g, s, seed, '02'),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="title-u">출장마사지 홈타이 : 하짓날 해넘이 ${esc(s.setS.slice(0, 5))} · 낮 ${esc(s.daySum)}</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 곳', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 쪽에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     쪽을 낼 칸이 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitW: mode === 'spot' ? '동' : mode === 'rural' ? '읍·면' : '행정동',
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area), nsKm: g.nsKm, ewKm: g.ewKm,
    noon: g.noon, sunrise: g.sunrise, sunset: g.sunset, dayLen: g.dayLen,
    topSpot: g.topSpot || '', botSpot: g.botSpot || '',
    eastSpot: g.eastSpot || '', westSpot: g.westSpot || '',
    riseSpread: g.riseSpread || 0, noonFirst: g.noonFirst || '',
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lede = `<div class="lede">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    mode === 'spot' ? ['쪽을 낸 동', `${g.spotCount}칸`]
      : mode === 'rural' ? ['쪽을 낸 동', '없음 — 행정동이 전부 읍·면입니다']
        : ['쪽을 낸 층', '시군구 선까지 — 동 이름은 아래에'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}칸 — 이름만 적음(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['복판 좌표', `북위 ${g.lat} · 동경 ${g.lng}`],
    ['남중(해의 정오)', g.noon],
    ['하짓날', `해돋이 ${g.sunrise} · 해넘이 ${g.sunset} · 낮 ${g.dayLen}`],
    ['벌어진 폭', `남북 ${g.nsKm}km · 동서 ${g.ewKm}km`],
    ['땅', km2(g.area)],
    ['여는 시각', `${esc(cfg.hours)} 접수 / ${esc(cfg.pay)}`],
  ];
  if (mode === 'spot' && g.topSpot) {
    rows.splice(8, 0,
      ['가장 북쪽 칸', `<a href="/${sd.slug}/${g.slug}/${g.topSpotSlug}/">${esc(g.topSpot)}</a> · 가장 남쪽 <a href="/${sd.slug}/${g.slug}/${g.botSpotSlug}/">${esc(g.botSpot)}</a>`],
      ['가장 동쪽 칸', `<a href="/${sd.slug}/${g.slug}/${g.eastSpotSlug}/">${esc(g.eastSpot)}</a> · 가장 서쪽 <a href="/${sd.slug}/${g.slug}/${g.westSpotSlug}/">${esc(g.westSpot)}</a>`],
      ['칸끼리 해돋이 차이', `${g.riseSpread}초`]);
  }
  const facts = stack('fact', 'counted', `${esc(g.name)} 하늘 장부`, factTable(rows), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lede,
    facts,
    callBand(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, '01') : mode === 'list' ? dongNameList(g, seed, '01') : '',
    ruralList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    nearList(sd, g, seed, '04'),
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="title-u">출장마사지 홈타이 : ${mode === 'spot' ? `동 ${g.spotCount}칸에 쪽을 냈습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}칸 모두 갑니다` : `행정동 ${g.dongCount}칸 모두 갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 곳', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    sunrise: sd.sunrise, sunset: sd.sunset, dayLen: sd.dayLen, noon: sd.noon,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lede = `<div class="lede"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = stack('fact', 'counted', `${esc(sd.name)} 하늘 장부`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 낸 층', sd.main ? '시군구 → 동' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 낸 동', `${sd.spotCount}칸`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}칸 · 시군구 쪽에 이름만 올림` : '없음'],
      ['복판 좌표', `북위 ${sd.lat} · 동경 ${sd.lng}`],
      ['남중(해의 정오)', sd.noon],
      ['하짓날', `해돋이 ${sd.sunrise} · 해넘이 ${sd.sunset} · 낮 ${sd.dayLen}`],
      ['동짓날 낮', `${sd.dayWin} — 여름과 ${hourMin(sd.gapMin)} 차이`],
      ['벌어진 폭', `남북 ${sd.nsKm}km · 동서 ${sd.ewKm}km`],
      sd.main && sd.earlySpot ? ['해가 가장 먼저 뜨는 칸', `${esc(sd.earlySpot)} ${esc(sd.earlyAt)}`] : ['받는 땅', km2(sd.area)],
      sd.main && sd.lateSpot ? ['해가 가장 늦게 지는 칸', `${esc(sd.lateSpot)} ${esc(sd.lateAt)}`] : ['여는 시각', `${esc(cfg.hours)} 접수 / ${esc(cfg.pay)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = stack('sidocourse', 'courses', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="tags">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스에 따라 손이 오래 머무는 데가 갈립니다. 값은 ${esc(sd.name)} 안이 전부 같습니다.`, '03');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.setS.localeCompare(a.s.setS) || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = stack('latest', 'dusk', `${esc(sd.name)}에서 해가 가장 늦게 지는 동`,
      `<ul class="tags">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${esc(x.s.setS.slice(0, 5))}</a></li>`).join('\n')}\n</ul>`,
      `서쪽에 치우친 칸일수록 여름 저녁이 오래 밝습니다. 여기 없는 칸은 시군구를 거쳐 들어가시면 됩니다.`, '02');
  } else {
    pickBlock = stack('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="tags">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동 수가 많을수록 같은 땅을 더 잘게 나눠 이름 붙였다는 뜻입니다.', '02');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lede,
    facts,
    callBand(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="title-u">출장마사지 홈타이 : ${sd.main ? `동 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} · 하짓날 해넘이 ${esc(sd.sunset.slice(0, 5))}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 곳', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
