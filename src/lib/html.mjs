import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { SUNMARK } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **askBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★귀퉁이를 비스듬히 잘라 칸을 가른다. 둥근 알약 모양을 쓰지 않는다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#0F7A7A">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/solace.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="skipto" href="#main">본문 바로 보기</a>
${header(ctx, path)}
${crumbs.length > 1 ? traceHtml(crumbs) : ''}
<main id="main">
<h1 class="title">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${ledgeBar(cfg)}
<script src="/assets/solace.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 귀퉁이가 잘린 네모지만 `<a href="tel:">` 이다. <button> 으로 두면
   스크립트 없이는 아무 일도 일어나지 않는다.
   size: s(머리) · m(본문) · l(대문·아래 줄) */
export function askBtn(cfg, { size = 'm', wide = false } = {}) {
  return `<a class="ask ask-${size}${wide ? ' ask-wide' : ''}" href="tel:${cfg.telRaw}">
  <span class="ask-ray" aria-hidden="true"><i></i><i></i><i></i></span>
  <span class="ask-t"><span class="ask-k">${esc(cfg.telLabel)}</span><span class="ask-v">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 흰 띠에 상호와 버튼, 메뉴는 밑줄로 현재 자리를 표시한다 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '가는 곳'], ['/course/', '코스'], ['/price/', '값'], ['/guide/', '처음이신가요'], ['/magazine/', '일지']];
  return `<header class="brim">
  <div class="brim-in">
    <a class="mark" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">
      ${SUNMARK()}<span class="mark-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <div class="brim-r">
      <p class="brim-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
      ${askBtn(cfg, { size: 's' })}
    </div>
  </div>
  <nav class="rail" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</header>`;
}

function traceHtml(crumbs) {
  return `<nav class="trace" aria-label="지금 보시는 자리"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. 흰 바탕 3열. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="sill">
  <div class="sill-in">
    <section>
      <p class="sl-nm">${esc(cfg.brand.ko)}</p>
      <p class="sl-say">앉아서 손님을 기다리는 자리가 없습니다. 부르시면 관리사가 그 주소로 움직입니다. 쪽을 둔 층은 시군구 ${counts.gu}곳과 동 ${counts.spot}칸이고, 들어오는 길은 아래 번호 하나입니다.</p>
      ${askBtn(cfg, { size: 'm' })}
      <p class="sl-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 미리 보내실 돈 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="sl-h">동 한 칸까지</p>
      <ul class="tags">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="sl-h">시군구 선까지</p>
      <ul class="tags">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="sl-sm"><a href="/area/">가는 곳 한 장에 펼치기</a> · 읍·면 ${counts.rural}칸은 이름만 적었습니다</p>
    </nav>
    <div>
      <p class="sl-h">문서</p>
      <ul class="sl-ul">
        <li><a href="/guide/">처음이신가요</a></li>
        <li><a href="/price/">값</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="sl-h" style="margin-top:18px">요새 적은 글</p>
      <ul class="sl-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="sl-h" style="margin-top:18px">가져가는 길</p>
      <ul class="tags"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="sl-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="sill-foot"><div>
    ${biz ? `<p class="sl-biz">${biz}</p>` : '<p class="sl-biz sl-faint">사업자 정보는 확정되는 대로 이 자리에 올립니다.</p>'}
    <p class="sl-ai">지역 쪽의 남중 시각과 해돋이·해넘이는 공개된 행정동 중심점 좌표를 천문 계산식에 넣어 뽑은 값이며, 문장은 <strong>AI 도구를 거쳐 초안을 잡고</strong> 사람이 고쳐 썼습니다. 후기와 체험담, 별점을 받지도 싣지도 않고 사람 사진을 올리지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="sl-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 질병을 다루는 의료 행위가 아니고 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function ledgeBar(cfg) {
  return `<div class="ledge">
  ${askBtn(cfg, { size: 'l', wide: true })}
  <span class="ledge-s">문 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 귀퉁이가 잘린 흰 판. 번호와 라벨은 제목 위에 작은 글씨로.
 */
export function stack(id, label, h2, inner, sub, n) {
  return `<section class="stack" id="${id}" aria-labelledby="${id}-h">
  <header class="stack-h">
    <span class="stack-no" aria-hidden="true">${esc(label)}${n ? ` / ${n}` : ''}</span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="stack-sb">${sub}</p>` : ''}
  </header>
  <div class="stack-b">${inner}</div>
</section>`;
}
