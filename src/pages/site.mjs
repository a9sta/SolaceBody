import { layout, stack, askBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, callBand, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="open" aria-label="첫 안내">
  <p class="open-sl">${esc(cfg.brand.slogan)}</p>
  <p class="open-p">들르실 가게가 없습니다. 전화를 주시면 관리사가 댁 주소로 움직입니다. 수도권과 부산은 동을 한 칸씩 적어 두었고, 대전·대구·울산과 지정한 시·군은 시군구에서 끊었습니다.</p>
  ${askBtn(cfg, { size: 'l' })}
  <dl class="open-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>해가 떠 있든 없든</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>지갑은 맨 마지막에</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>거의 이 안에 도착합니다</dd></div>
    <div><dt>동 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳 아래</dd></div>
  </dl>
</section>`;

  const areaBlock = stack('area', 'where', '어느 동네에서 부르시나요',
    `<div class="pair">
      <div>
        <p class="pair-h">동 한 칸까지</p>
        <ul>${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>${r.gu.length}곳 · ${r.spotCount}칸</span></a></li>`).join('\n')}</ul>
      </div>
      <div>
        <p class="pair-h">시군구에서 멈춤</p>
        <ul>${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="stack-end">층이 갈려도 받는 번호와 값은 하나입니다. <a href="/area/">가는 곳을 한 장에</a> 펼쳐 두었습니다.</p>`,
    '층을 둘로 둔 것은 적어 놓은 깊이가 다른 것뿐입니다. 방문 범위를 줄인 것이 아닙니다.', '01');

  const whyBlock = stack('why', 'method', '왜 해 뜨는 시각부터 적나요?',
    `<div class="lede">
      <p>동 쪽을 열면 그 자리에서 <strong>해가 몇 시에 떠서 몇 시에 지는지</strong>가 적혀 있습니다. 같은 저녁 일곱 시라도 서쪽 끝 ${esc(counts.westName)}${josa(counts.westName, '과/와')} 동쪽 끝 ${esc(counts.eastName)}${josa(counts.eastName, '은/는')} 바깥 밝기가 다릅니다. 두 칸의 남중 시각이 ${counts.noonSpread}초나 벌어지기 때문입니다.</p>
      <p>방문하는 쪽에서는 이게 실제 문제가 됩니다. 해가 넘어간 골목에서는 번지와 동 호수가 잘 보이지 않아 문 앞에서 시간을 버립니다. 그래서 <strong>어두워진 뒤 접수에는 들어오는 길을 한 번 더 여쭙습니다</strong>.</p>
      <p>모두 공개된 행정동 중심점 좌표를 천문 계산식에 넣어 뽑았고, 날짜를 고정해 두어 다시 계산해도 같은 값이 나옵니다. 계산하는 방법은 <a href="/magazine/why-sunset-matters/">일지에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = stack('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="rack">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="stack-end"><a href="/magazine/">일지 전부 보기</a></p>`,
    '체험담이 아닙니다. 먼저 보시면 통화가 줄어드는 것만 추렸습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르시는 자리', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, 'popular', '문의가 많은 자리', null, '08'),
    callBand(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="title-u">서울·인천·경기·부산 동 ${counts.spot}칸 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const lede = `<div class="lede">
  <p>쪽이 있는 자리를 이 한 화면에 모두 펼쳤습니다. 시군구 ${counts.gu}곳, 동 ${counts.spot}칸입니다. 읍·면 ${counts.rural}칸은 쪽이 없을 뿐 똑같이 받고 똑같이 갑니다.</p>
  <p>수도권과 부산에서는 동을 하나씩 눌러 보실 수 있고, 나머지는 시군구 쪽 안에 동 이름을 적어 두었습니다. 깊이를 다르게 둔 것은 연락이 몰리는 쪽을 더 잘게 쪼갠 결과입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => stack(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}칸` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="grid">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="g-n">${esc(g.name)}</span><span class="g-s">${g.plainCount ? `동 ${g.plainCount}${g.ruralCount ? `+${g.ruralCount}` : ''}` : `읍면 ${g.ruralCount}`}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서 시군구를 누르시면 그 아래 동이 나옵니다. 하짓날 이 지역의 해넘이는 ${r.sunset}입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구가 끝입니다. 행정동 ${r.dongCount}칸 이름은 각 시군구 쪽 안에 들어 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '98');

  const body = [lede, callBand(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, '99')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `가는 곳 <span class="title-u">시군구 ${counts.gu}곳과 동 ${counts.spot}칸을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '가는 곳', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const lede = `<div class="lede">
  <p>모두 ${courses.length}가지입니다. 정하실 것은 셋입니다 — 얼마나 세게, 몇 분, 기름을 쓸지. 그 밖은 통화하면서 맞춰 드립니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 길게 받는다고 세게 받는 것이 아니며, 값이 높다고 더 나은 것도 아닙니다.</p>
</div>`;

  const table = stack('all', 'table', `${courses.length}가지를 나란히 놓고`,
    `<table class="versus"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">값</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '값이 낮은 쪽부터 세웠습니다. 어느 지역에서 부르셔도 같은 숫자입니다.', '01');

  const pickBy = stack('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="rack">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고르신 뒤에 바꾸셔도 됩니다. 셈은 마지막에 받으신 코스를 기준으로 합니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [lede, table, pickBy, callBand(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾아보기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 시간, 기름 여부로 나란히 놓았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="title-u">손의 세기와 길이, 기름을 쓰는지로 갈라 보기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 값 ───────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lede = `<div class="lede">
  <p>표 한 장이 전부입니다. 이 표에 없는 돈은 어떤 이름으로도 받지 않습니다.</p>
  <p>길 건너 동네든 한 시간을 달리는 읍내든 코스가 같으면 숫자가 같습니다. 멀리 가는 날의 부담을 손님 쪽으로 넘기지 않기로 정했습니다.</p>
</div>`;

  const table = stack('tbl', 'prices', '코스별 기본 시간과 값',
    `<table class="versus"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">값</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 견주시라고 붙인 것입니다. 실제 셈을 분으로 쪼개지는 않습니다.', '01');

  const noExtra = stack('nox', 'never', '붙지 않는 것들',
    `<ul class="mind">
      <li>차비 — 거리가 아무리 멀어도 청구서에 올리지 않습니다.</li>
      <li>심야 할증 — 해가 진 뒤에 부르셔도 표 그대로입니다.</li>
      <li>명절·휴일 할증 — 달력을 보고 값을 올리지 않습니다.</li>
      <li>앞서 보내는 돈 — 예약금이나 보증금 자체가 없습니다.</li>
      <li>취소 수수료 — 미루시든 접으시든 물리지 않습니다.</li>
      <li>주차비 — 저희 쪽에서 냅니다.</li>
    </ul>`,
    '돈부터 보내라는 연락이 오면 저희 쪽이 아닙니다.', '02');

  const pay = stack('how', 'payment', '값은 어떻게 내나요?',
    factTable([
      ['내는 때', '손을 놓은 그 자리에서'],
      ['수단', '현금·카드 모두 — 숫자가 같습니다'],
      ['영수증', '말씀하시면 드립니다'],
      ['시간을 늘릴 때', '접수 때 정하시면 늘어난 만큼만 붙습니다'],
      ['두 분이 받을 때', '한 분씩 따로 셉니다. 둘이라고 깎아 드리지 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [lede, table, noExtra, pay, callBand(cfg, '값 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`값 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 시간과 값입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 관리가 끝난 뒤 현금이나 카드로 받습니다.`),
      h1: `값 <span class="title-u">${won(sorted[0].price)}원부터 : 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '값', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 처음이신가요 ─────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const lede = `<div class="lede">
  <p>처음 연락 주시는 분을 머리에 두고 적었습니다. 전화 한 통이면 끝나는 일이라 오래 붙들고 계실 것이 없습니다.</p>
</div>`;

  const what = stack('need', 'ready', '무엇을 준비해 두나요?',
    `<ul class="mind">
      <li>몸을 펼 자리 하나 — 바닥이어도 침대여도 됩니다.</li>
      <li>수건 두 장 — 쓰시던 것으로 충분하고, 기름 없는 코스는 한 장이면 됩니다.</li>
      <li>닫히는 문이 있는 방 하나 — 식구분들이 계셔도 상관없습니다.</li>
    </ul>
    <p class="stack-end">깔개와 기름, 접이식 베드는 관리사 가방에 들어 있습니다. 새로 장만하실 것이 없습니다.</p>`,
    null, '01');

  const timing = stack('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 어느 시각이든 번호 하나`],
      ['도착', `대개 ${esc(cfg.arrive)}, 어두운 골목 안쪽이면 더 걸립니다`],
      ['시간 변경', '언제든 되고 따로 붙는 돈이 없습니다'],
      ['취소', '관리사가 문 앞에 닿았다면 그것만 알려 주십시오'],
      ['붐비는 때', '금요일과 토요일 밤'],
      ['여유 있는 때', '평일 낮 — 기다리실 일이 거의 없습니다'],
    ]), null, '02');

  const refuse = stack('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="mind">
      <li>성적인 이야기가 섞여 들어올 때 — 그 자리에서 통화를 끊습니다.</li>
      <li>열이 오르거나 상처가 부어 있을 때 — 날짜를 미뤄 드립니다.</li>
      <li>주소를 끝까지 주지 않으실 때 — 누구를 어디로 보낼지 정할 수 없습니다.</li>
      <li>관리사와 사적으로 연락할 방법을 달라고 하실 때.</li>
      <li>진료가 먼저로 보일 때 — 병원 쪽을 권해 드립니다.</li>
      <li>만 열아홉 살이 되지 않으셨을 때.</li>
    </ul>`,
    '돌려 드리는 경우에도 받는 돈이 없습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');

  const body = [lede, what, timing, stepList(seed, '04'), refuse, callBand(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('처음이신가요 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 추렸습니다. 준비물, 접수 시각, 못 받는 경우, 값 내는 법을 차례로 적었습니다.'),
      h1: `처음이신가요 <span class="title-u">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '처음이신가요', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const lede = `<div class="lede">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 건 자리 없이 방문만 하는 곳입니다. 업소를 여럿 늘어놓고 이어 주는 중개 사이트가 아닙니다. 저희가 받고 저희가 갑니다.</p>
  <p>이름은 위안(solace)과 몸(body)을 붙여 지었습니다. 해가 기운 뒤에 찾아가 몸을 쉬게 한다는 뜻으로 읽어 주시면 됩니다.</p>
</div>`;

  const line = stack('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="mind">
      <li>합니다 — 손으로 굳은 근육을 풀어 주는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 형태로도 두지 않았습니다.</li>
      <li>안 합니다 — 진단과 치료. 그 일은 의료기관의 몫입니다.</li>
      <li>안 받습니다 — 만 열아홉 살이 되지 않으신 분.</li>
      <li>안 싣습니다 — 후기와 별점. 참인지 거짓인지 가릴 길이 없습니다.</li>
      <li>안 올립니다 — 사람 사진. 화면과 실제가 어긋나는 일이 너무 흔합니다.</li>
      <li>안 받습니다 — 선입금. 앞서 받는 돈을 두지 않았습니다.</li>
    </ul>`, null, '01');

  const how = stack('data', 'sources', '이 시각들은 어떻게 나왔나요?',
    `<div class="lede">
      <p>지역 쪽의 해돋이·해넘이·남중 시각은 공개된 행정동 경계에서 중심점을 구한 뒤, 그 좌표를 미국 해양대기청이 공개한 태양 위치 근사식에 넣어 계산한 값입니다.</p>
      <p>우리나라 표준시는 동경 135도를 기준으로 삼습니다. 그런데 이 땅은 그보다 서쪽에 있어서 <strong>해의 정오가 시계의 정오보다 늘 늦습니다</strong>. 서쪽 끝 ${esc(counts.westName)}${josa(counts.westName, '과/와')} 동쪽 끝 ${esc(counts.eastName)}${josa(counts.eastName, '은/는')} 그 늦는 정도가 ${counts.noonSpread}초 차이 납니다.</p>
      <p>날짜는 하지(6월 21일)·동지(12월 21일)·춘분(3월 20일) 셋으로 고정했습니다. 오늘 날짜를 넣으면 화면이 매일 바뀌어 같은 주소에서 같은 내용을 보여 준다는 원칙이 깨지기 때문입니다.</p>
      <p>대기 굴절과 지평선 높이는 표준값(-0.833도)을 썼습니다. 산이 가린 자리에서는 실제 해돋이가 몇 분 늦을 수 있고, 그것까지 반영하지는 않았습니다. 천문 관측용이 아니라 방문 시각을 가늠하는 용도입니다.</p>
    </div>
    ${factTable([
      ['자료를 가져온 곳', esc(data.source)],
      ['원자료 판', esc(data.version)],
      ['쓰는 값', esc(data.axis)],
      ['계산 방법', esc(data.method)],
      ['쪽을 내는 기준', esc(data.coverageFrom)],
      ['쪽을 낸 단위', `시도 ${counts.sido} / 시군구 ${counts.gu} / 동 ${counts.spot}`],
      ['쪽이 없는 단위', `읍 ${counts.eup}칸 · 면 ${counts.myeon}칸 — 목록에 이름만`],
      ['남북 양 끝', `${esc(counts.northName)}(북위 ${counts.northLat}) ~ ${esc(counts.southName)}(북위 ${counts.southLat})`],
      ['동서 양 끝', `${esc(counts.eastName)}(동경 ${counts.eastLng}) ~ ${esc(counts.westName)}(동경 ${counts.westLng})`],
      ['하짓날 낮 길이 폭', `${Math.floor(counts.dayMax / 60)}시간 ${counts.dayMax % 60}분 ~ ${Math.floor(counts.dayMin / 60)}시간 ${counts.dayMin % 60}분`],
    ])}`, null, '02');

  const body = [lede, line, how, callBand(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽의 해 뜨고 지는 시각을 어떤 자료로 어떻게 계산했는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="title-u">하는 일의 끝과 계산 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (목적)', '이 약관은 솔레이스바디(이하 "회사")가 제공하는 출장 방문 관리 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정하기 위한 것입니다.'],
  ['제2조 (접수 방법)', '접수는 사이트에 표기된 번호로 거시는 통화로만 받습니다. 이 번호는 중계 번호이므로 이용자의 전화번호가 관리사에게 그대로 넘어가지 않습니다. 메신저나 게시판, 전자우편을 통한 접수는 받지 않습니다.'],
  ['제3조 (제공하는 것과 제공하지 않는 것)', '회사는 이용자가 지정하신 장소에 관리사를 보내어 손으로 근육의 긴장을 푸는 일을 합니다. 질병을 진단하거나 치료하는 행위는 하지 않고, 성적 서비스 역시 어떤 형태로도 하지 않습니다.'],
  ['제4조 (이용 자격)', '만 19세가 넘으신 분에 한해 이용하실 수 있습니다. 그에 미치지 않는 분의 접수는 어떤 경우에도 받지 않습니다.'],
  ['제5조 (천문 정보의 성격)', '사이트에 표기된 해돋이·해넘이·남중 시각과 낮의 길이는 공개된 행정동 중심점 좌표를 표준 태양 위치 계산식에 넣어 산출한 값입니다. 지형과 건물에 가린 실제 체감 일조와 다를 수 있으며, 방문 시각을 가늠하는 참고 자료입니다.'],
  ['제6조 (요금과 결제)', '요금은 값 안내와 동일하며 지역에 따라 달라지지 않습니다. 결제는 관리가 끝난 현장에서 현금이나 카드로 이루어집니다. 예약금이나 보증금처럼 앞서 받는 돈은 어떤 이름으로도 두지 않았습니다.'],
  ['제7조 (변경과 취소)', '방문 전에는 언제든 시간 변경과 취소가 가능하고 위약금이 없습니다. 다만 관리사가 이미 현장에 닿은 뒤라면 그 사실을 지체 없이 알려 주셔야 합니다.'],
  ['제8조 (접수 거절과 중단 사유)', '아래 어느 하나에 해당할 때 회사는 접수를 받지 않거나 하고 있던 관리를 멈출 수 있습니다. 1. 성적인 서비스를 요구하실 때. 2. 관리사에게 거친 말이나 물리력을 쓰거나 사적인 연락처를 달라고 하실 때. 3. 방문할 주소를 끝까지 주지 않으실 때. 4. 열이 있거나 아물지 않은 상처가 있어 관리가 알맞지 않을 때.'],
  ['제9조 (이용자가 해 주셔야 할 것)', '이용자께서는 관리를 받을 자리와 수건을 마련해 두시고, 진행에 영향을 줄 수 있는 몸 상태가 있다면 접수 통화에서 말씀해 주셔야 합니다.'],
  ['제10조 (평가 게시를 두지 않음)', '회사는 별점이나 이용 후기를 받아 두지도, 화면에 올리지도 않습니다. 이 사이트에 적힌 어느 문장도 특정한 이용자의 경험담을 옮겨 온 것이 아닙니다.'],
  ['제11조 (중단했을 때의 요금)', '이용자의 요청이나 몸 상태 때문에 멈춘 때에는 그때까지 흘러간 시간만큼만 셈합니다. 시작하고 10분을 넘기지 않았다면 받지 않습니다. 다만 제8조 제1호에 해당하여 멈춘 때에는 멈춘 시점까지를 셈합니다.'],
  ['제12조 (손해의 부담)', '관리하는 동안 회사의 잘못으로 생긴 손해는 회사가 물어 드립니다. 다만 미리 알려 주지 않으신 몸 상태에서 비롯한 손해, 그리고 천재지변이나 통신 장애로 늦어진 일에는 책임을 지지 않습니다.'],
  ['제13조 (약관의 변경)', '약관을 변경하는 경우 사이트에 먼저 올리고 올린 날부터 적용합니다. 변경 후 접수하시면 변경된 약관에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lede"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 거시는 순간 이 내용에 동의하신 것으로 봅니다.</p></div>`,
    stack('terms', 'terms', '전문', `<div class="deed">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    callBand(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 방법과 서비스 내용, 요금과 결제, 변경·취소를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="title-u">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 수집하는 항목', '접수 통화에서 받아 적는 것은 네 가지입니다 — 방문할 주소, 연락 가능한 번호, 고르신 코스, 원하시는 시각. 이름과 생년월일, 주민등록번호는 받지 않습니다.'],
  ['2. 이용 목적', '받아 적은 내용은 관리사 배정과 출발·도착 안내에만 씁니다. 이후 광고성 문자를 보내거나 먼저 연락드리는 일이 없습니다.'],
  ['3. 전화번호 처리', '화면에 적힌 번호는 중계용 번호입니다. 그래서 이용자의 번호가 관리사 쪽으로 그대로 넘어가지 않습니다.'],
  ['4. 보유 기간', '방문이 정상적으로 끝나면 당일 파기합니다. 분쟁이 생긴 건에 한해 처리가 끝날 때까지 따로 보관합니다.'],
  ['5. 제3자 제공과 위탁', '바깥 사업자에게 넘기거나 맡기지 않습니다. 법에 따른 수사기관의 적법한 요구가 있을 때만 예외로 둡니다.'],
  ['6. 자동 수집 장치', '이 사이트는 미리 만들어 둔 파일만 내보냅니다. 로그인과 장바구니, 댓글 기능이 없고 광고 추적이나 방문자 분석 스크립트를 넣지 않았습니다. 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '가지고 있는 내용을 보여 달라거나 지워 달라고 하실 수 있습니다. 같은 번호로 연락 주시면 그 통화 안에서 처리합니다.'],
  ['8. 개인정보 책임자', '사업자 정보가 확정되는 대로 이 항목과 화면 아래에 함께 적습니다. 그 전까지는 사이트에 표기된 번호가 접수 창구 노릇을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="lede"><p>내용이 짧습니다. 받아 적는 항목 자체가 네 가지뿐이기 때문입니다.</p></div>`,
    stack('pp', 'privacy', '전문', `<div class="deed">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    callBand(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 받아 적는 항목과 이용 목적, 보유 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="title-u">받아 적는 항목 네 가지</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 일지 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="lede"><p>부르시기 전에 알아 두면 통화가 줄어드는 것만 적습니다. 소감이나 후기는 올리지 않습니다.</p></div>`,
    stack('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="rack">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글이 올라가면 RSS 로도 함께 나갑니다.', '01'),
    callBand(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('해그림자 일지'),
      desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `해그림자 일지 <span class="title-u">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '일지', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '해그림자 일지', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="stamp"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 해그림자 일지</p>`,
    `<article class="essay">${html}</article>`,
    callBand(cfg, '접수', p.slug),
    stack('more', 'next', '함께 읽을 글',
      `<ul class="rack">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '일지', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="lede"><p>그 주소에는 쪽이 없습니다. 옮겨 갔거나 처음부터 만들지 않은 자리입니다. 아래에서 다시 골라 주십시오.</p></div>`,
    stack('back', 'back', '여기서 다시',
      `<ul class="tags">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">가는 곳</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">값</a></li>
        <li><a href="/guide/">처음이신가요</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    callBand(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 쪽이 없습니다. 아래에서 다시 골라 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
