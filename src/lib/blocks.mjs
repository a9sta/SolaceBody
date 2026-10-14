import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { stack, askBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function callBand(cfg, place, seedKey) {
  const h = hash(seedKey, 'cb');
  const lines = [
    `${place}이라고만 하셔도 됩니다. 남은 주소는 저희가 되읊으며 맞춰 드립니다.`,
    `${place}까지 지금 닿을 수 있는지 통화에서 바로 확인해 드립니다.`,
    `${place}에 가는 데 필요한 것은 코스와 시각, 주소 셋뿐입니다.`,
    `${place} 접수는 이 번호에서만 받습니다. 그 밖의 창구를 아예 만들지 않았습니다.`,
  ];
  return `<section class="call" aria-label="${esc(place)} 예약 문의">
  <p class="call-p">${esc(at(h, lines))}</p>
  ${askBtn(cfg, { size: 'l' })}
  <p class="call-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 설명을 전부 달면 어느 쪽이든 같은 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="c-n">${esc(c.ko)}</span>
      <span class="c-w">${won(c.price)}원<span class="c-s">세기 ${esc(c.pressure)} · ${c.min}분${c.oil ? ' · 기름 있음' : ' · 기름 없음'}</span></span>
    </a>
    ${withText.has(c.slug) ? `<p class="c-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  return stack('course', 'courses', `${esc(place)}에 가져가는 일곱 가지`,
    `<ul class="carte">\n${list}\n</ul>
     <p class="stack-end">${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return stack('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="flight">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="ledger"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = stack('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="asked">\n${qa.map((x, i) => `<div><span class="anum" aria-hidden="true">물음 ${i + 1}</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return stack('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="mind">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return stack('longtail', label, heading, `<ul class="tags">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 해가 비슷하게 드는 이웃 칸 ────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순이 아니라
     **위도가 가까운 칸**과 **해넘이가 가장 이르고 늦은 칸**을 건다. */
export function sunKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const pick = [];
  const seen = new Set();
  const add = (x, why) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push({ x, why }); } };
  // 위도가 가까운 순으로 넷
  pool.slice().sort((a, b) => Math.abs(a.lat - s.lat) - Math.abs(b.lat - s.lat))
    .slice(0, 4).forEach((x) => add(x, `북위 ${x.lat}`));
  const byRise = pool.slice().sort((a, b) => a.riseS.localeCompare(b.riseS));
  add(byRise[0], `해돋이 ${byRise[0].riseS.slice(0, 5)}`);
  add(byRise[byRise.length - 1], `해돋이 ${byRise[byRise.length - 1].riseS.slice(0, 5)}`);
  const bySet = pool.slice().sort((a, b) => b.setS.localeCompare(a.setS));
  add(bySet[0], `해넘이 ${bySet[0].setS.slice(0, 5)}`);
  for (const x of pool) add(x, `남중 ${x.noon.slice(0, 5)}`);
  return stack('kin', 'sunkin', `${esc(g.name)} 안에서 해의 자리로 견주기`,
    `<ul class="grid">\n${pick.slice(0, 8).map(({ x, why }) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="g-n">${esc(x.name)}</span><span class="g-s">${esc(why)}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'sk'), SEC.sunKinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="here"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="g-n">${esc(s.name)}</span><span class="g-s">${esc(s.setS.slice(0, 5))}</span></a></li>`).join('\n');
  return stack('spotidx', 'places', `${esc(g.name)} 안에 쪽을 세운 ${g.spotCount}칸`,
    `<ul class="grid">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return stack('rural', 'rural', `${esc(g.name)}에 딸린 ${esc(label)}칸`,
    `<ul class="plain">\n${g.rural.map((m) => `<li>${esc(m.name)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return stack('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}칸`,
    `<ul class="plain">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="here"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="g-n">${esc(g.name)}</span><span class="g-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n');
  return stack('guidx', 'districts', `${esc(sd.name)}${josa(sd.name, '을/를')} 이루는 시군구 ${sd.gu.length}곳`,
    `<ul class="grid">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 옆 시군구 (길을 거는 용도) ──────────────────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="g-n">${esc(t.gu)}</span><span class="g-s">${t.same ? esc(sd.name) : '시도 밖'}</span></a></li>`).join('\n');
  return stack('near', 'next', `${esc(g.name)}에 맞붙은 시군구 ${g.nearCount}곳`,
    `<ul class="grid">\n${items}\n</ul>`,
    '구 경계에 붙은 주소라면 옆 시군구 쪽에서 들어가시는 편이 빠를 때가 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return stack('also', 'more', '이어서 볼 곳',
    `<ul class="tags">
      <li><a href="/area/">가는 곳 전부</a></li>
      <li><a href="/guide/">처음이신가요</a></li>
      <li><a href="/price/">값</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">일지</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '층은 시도에서 시군구로 내려가고 수도권과 부산에만 동이 한 겹 더 있습니다. 읍·면과 서브 지역의 동은 이름만 목록에 올라 있습니다.');
}
