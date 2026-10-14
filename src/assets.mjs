import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **비스듬히 잘린 모서리**다. 칸마다 오른쪽 위 귀퉁이를 45도로 잘라 내고
 *   그 자리에 번호를 둔다. 목록은 거의 각진 네모 타일로 깐다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *   ★여기는 **잘린 귀퉁이**와 **각진 타일**이다. 둥근 알약을 한 군데도 쓰지 않는다.
 *   ★배색은 따뜻한 상아 바탕에 청록 하나. 앞선 아홉 곳의 강조색과 색상환에서
 *     가장 멀리 떨어진 자리다(녹색 147도와 파랑 215도 사이가 비어 있었다).
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#F6F2EA', card: '#FFFFFF', soft: '#ECE5D8',
  ink: '#23201A', dim: '#6B6456',
  acc: '#0F7A7A', accDk: '#0A5757', accSoft: '#DEEDEC',
  line: '#DED5C4', sun: '#C07A14',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--sun:${t.sun};
  --w:1060px;--cut:22px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.82;font-size:16px;letter-spacing:-.005em;padding-bottom:86px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--accDk);font-weight:700}
.skipto{position:absolute;left:-9999px}
.skipto:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#fff;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.brim{background:var(--card);border-bottom:1px solid var(--line)}
.brim-in{max-width:var(--w);margin:0 auto;padding:16px 20px 12px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.mark{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.mark:hover{text-decoration:none}
.smk{width:32px;height:32px;flex:none}
.mark-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.mark-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--dim)}
.brim-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.brim-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.brim-run span{display:block}
.rail{background:var(--card)}
.rail ul{max-width:var(--w);margin:0 auto;padding:0 20px 11px;list-style:none;display:flex;gap:0;overflow-x:auto}
.rail a{display:block;padding:7px 16px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;
  border-bottom:3px solid transparent}
.rail a:hover{color:var(--accDk);text-decoration:none}
.rail a[aria-current]{color:var(--accDk);border-bottom-color:var(--acc)}

/* ── 자리표 ────────────────────────────────────────── */
.trace{max-width:var(--w);margin:0 auto;padding:10px 20px 0}
.trace ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.trace li+li::before{content:"›";margin-right:8px;color:var(--acc)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:18px 20px 56px}
.title{font-size:27px;font-weight:800;letter-spacing:-.035em;line-height:1.3;margin:12px 0 18px}
@media (min-width:720px){.title{font-size:35px}}
.title-u{display:block;margin-top:11px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.008em}
.lede{margin:0 0 28px;max-width:52rem}
.lede p{margin:0 0 .9em}
.lede p:last-child{margin-bottom:0}

/* ── 칸 = 귀퉁이 잘린 흰 판 ───────────────────────── */
.stack{background:var(--card);padding:24px 20px;margin:0 0 14px;position:relative;
  clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,0 100%)}
.stack::after{content:"";position:absolute;right:0;top:0;width:var(--cut);height:var(--cut);
  background:linear-gradient(225deg,var(--soft) 0 50%,transparent 50%)}
.stack-h{margin:0 0 15px;padding-right:34px}
.stack-no{margin:0 0 7px;display:block;font-family:var(--mono);font-size:10px;letter-spacing:.22em;
  color:var(--acc);text-transform:uppercase}
.stack h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.028em;line-height:1.38}
@media (min-width:720px){.stack h2{font-size:22px}}
.stack-sb{margin:9px 0 0;font-size:14px;color:var(--dim)}
.stack-end{margin:16px 0 0;font-size:13px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.ledger{width:100%;border-collapse:collapse;font-size:14.5px}
.ledger th,.ledger td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.ledger th{width:40%;font-weight:700;color:var(--dim);font-size:13px;background:var(--paper)}
.ledger tr:last-child th,.ledger tr:last-child td{border-bottom:0}
@media (min-width:600px){.ledger th{width:26%}}

/* ── 코스 ──────────────────────────────────────────── */
.carte{list-style:none;margin:0;padding:0;display:grid;gap:9px}
@media (min-width:640px){.carte{grid-template-columns:1fr 1fr}}
.carte>li{background:var(--paper);border-radius:3px;padding:14px 16px;border-left:3px solid var(--acc)}
.carte a{display:block;color:var(--ink)}
.carte a:hover{text-decoration:none;color:var(--accDk)}
.c-n{display:block;font-size:16px;font-weight:800;letter-spacing:-.02em}
.c-w{display:block;margin-top:4px;font-family:var(--mono);font-size:15px;color:var(--accDk);font-weight:700}
.c-s{display:block;margin-top:3px;font-size:12.5px;color:var(--dim)}
.c-t{margin:10px 0 0;font-size:13px;color:var(--dim)}

/* ── 차례 ──────────────────────────────────────────── */
.flight{list-style:none;margin:0;padding:0;counter-reset:fl;display:grid;gap:2px}
.flight li{background:var(--paper);padding:14px 16px 14px 54px;position:relative;border-radius:3px}
.flight li::before{content:counter(fl,decimal-leading-zero);counter-increment:fl;position:absolute;left:16px;top:15px;
  font-family:var(--mono);font-size:13px;font-weight:700;color:var(--sun)}
.flight h3{margin:0 0 4px;font-size:15px;font-weight:800}
.flight p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.asked{display:grid;gap:3px}
.asked>div{background:var(--paper);padding:15px 17px;border-radius:3px}
.asked .anum{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--sun);margin-bottom:5px}
.asked h3{margin:0 0 7px;font-size:16px;font-weight:800;letter-spacing:-.02em}
.asked p{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.mind{list-style:none;margin:0;padding:0;display:grid;gap:1px;background:var(--line)}
.mind li{background:var(--card);padding:11px 15px;font-size:14px;color:var(--dim)}

/* ── 목록·링크 ─────────────────────────────────────── */
.tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.tags a{display:block;background:var(--paper);padding:7px 14px;font-size:13.5px;color:var(--ink);border-radius:3px}
.tags a:hover{background:var(--accSoft);color:var(--accDk);text-decoration:none}
.grid{list-style:none;margin:0;padding:0;display:grid;gap:5px}
@media (min-width:560px){.grid{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.grid{grid-template-columns:1fr 1fr 1fr}}
.grid a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;background:var(--paper);
  padding:10px 13px;color:var(--ink);border-radius:3px;border-left:2px solid var(--line)}
.grid a:hover{background:var(--accSoft);border-left-color:var(--acc);text-decoration:none}
.grid .here a,.grid a[aria-current]{background:var(--acc);color:#fff;border-left-color:var(--sun)}
.grid .here a .g-s,.grid a[aria-current] .g-s{color:rgba(255,255,255,.82)}
.g-n{font-weight:700;font-size:14.5px}
.g-s{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.plain{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 6px}
.plain li{font-size:13px;color:var(--dim);background:var(--paper);padding:4px 11px;border-radius:3px}

/* ── 견주기 ────────────────────────────────────────── */
.versus{width:100%;border-collapse:collapse;font-size:14px}
.versus th,.versus td{padding:10px 11px;text-align:left;border-bottom:1px solid var(--line)}
.versus thead th{font-size:12px;color:var(--dim);font-weight:700;border-bottom:2px solid var(--acc)}
.versus tbody th{font-weight:700}
.versus tbody tr.here th,.versus tbody tr.here td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.ask{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#fff;
  padding:10px 20px;text-decoration:none;
  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)}
.ask:hover{background:var(--accDk);text-decoration:none}
.ask-ray{flex:none;display:block;width:14px;height:14px;opacity:.9}
.ask-ray i{display:block;height:2px;background:#fff;margin-bottom:3px}
.ask-ray i:nth-child(1){width:14px}
.ask-ray i:nth-child(2){width:10px}
.ask-ray i:nth-child(3){width:6px;margin-bottom:0}
.ask-t{display:flex;flex-direction:column;line-height:1.24;min-width:0}
.ask-k{font-size:10px;letter-spacing:.2em;opacity:.86;font-family:var(--mono)}
.ask-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.ask-s .ask-v{font-size:15px}
.ask-m .ask-v{font-size:18px}
.ask-l .ask-v{font-size:21px}
.ask-l{padding:12px 24px}
.ask-wide{display:flex;width:100%;justify-content:center}
.call{background:var(--accSoft);padding:22px 20px;margin:0 0 14px;border-top:3px solid var(--acc)}
.call-p{margin:0 0 14px;font-size:15px;max-width:48rem}
.call-s{margin:12px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.open{background:var(--card);padding:30px 22px;margin:0 0 14px;position:relative;
  clip-path:polygon(0 0,calc(100% - 34px) 0,100% 34px,100% 100%,0 100%)}
.open-sl{margin:0 0 14px;font-size:22px;font-weight:800;letter-spacing:-.035em;color:var(--accDk);max-width:21em}
@media (min-width:720px){.open-sl{font-size:28px}}
.open-p{margin:0 0 20px;color:var(--dim);font-size:15px;max-width:46rem}
.open-f{display:grid;gap:1px;margin:22px 0 0;background:var(--line)}
@media (min-width:640px){.open-f{grid-template-columns:1fr 1fr 1fr 1fr}}
.open-f div{background:var(--paper);padding:13px 15px}
.open-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--accDk)}
.open-f dd{margin:3px 0 0;font-size:12.5px;color:var(--dim)}
.pair{display:grid;gap:18px}
@media (min-width:760px){.pair{grid-template-columns:1fr 1fr}}
.pair-h{margin:0 0 11px;font-size:13px;font-weight:800;letter-spacing:.05em;color:var(--sun);font-family:var(--mono)}
.pair ul{list-style:none;margin:0;padding:0;display:grid;gap:5px}
.pair a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;background:var(--paper);
  padding:11px 15px;color:var(--ink);border-radius:3px}
.pair a:hover{background:var(--accSoft);text-decoration:none}
.pair b{font-size:15px}
.pair span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 글 ────────────────────────────────────────────── */
.essay{max-width:46rem}
.essay h2{margin:30px 0 12px;font-size:19px;font-weight:800;color:var(--accDk)}
.essay p{margin:0 0 1em}
.essay ul{margin:0 0 1em;padding-left:1.1em;color:var(--dim)}
.rack{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rack a{display:block;background:var(--paper);padding:15px 17px;color:var(--ink);border-left:3px solid var(--sun);border-radius:3px}
.rack a:hover{background:var(--accSoft);text-decoration:none}
.rack b{display:block;font-size:16px;font-weight:800;margin-bottom:5px}
.rack p{margin:0;font-size:13.5px;color:var(--dim)}
.rack time{display:block;margin-top:7px;font-family:var(--mono);font-size:11px;color:var(--acc)}
.deed h2{margin:26px 0 9px;font-size:17px;font-weight:800;color:var(--accDk)}
.deed p,.deed li{font-size:14.5px;color:var(--dim)}
.deed ul,.deed ol{padding-left:1.2em;margin:0 0 1em}
.stamp{margin:0 0 14px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.sill{background:var(--card);margin-top:20px;border-top:3px solid var(--acc)}
.sill-in{max-width:var(--w);margin:0 auto;padding:30px 20px 22px;display:grid;gap:24px}
@media (min-width:860px){.sill-in{grid-template-columns:1.3fr 1fr 1fr}}
.sl-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.22em;color:var(--sun)}
.sl-nm{margin:0 0 8px;font-size:18px;font-weight:800}
.sl-say{margin:0 0 14px;font-size:13.5px;color:var(--dim)}
.sl-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.sl-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px}
.sl-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.sl-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.sill-foot{background:var(--card)}
.sill-foot div{max-width:var(--w);margin:0 auto;padding:0 20px 22px;border-top:1px solid var(--line);padding-top:18px}
.sl-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.sl-faint{opacity:.72}
.sl-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.7}
.sl-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.ledge{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:1px solid var(--line);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;
  box-shadow:0 -2px 12px rgba(35,32,26,.09);transition:transform .2s}
.ledge.hid{transform:translateY(130%)}
.ledge-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.ledge{display:none}}
@media print{.ledge,.rail,.call{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.ledge'),ft=document.querySelector('.sill');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('hid',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 지평선 위로 반쯤 올라온 해 — 반원과 광선 넷 */
const SUNRISE = (a, b, w) => `<g fill="none" stroke="${a}" stroke-width="${w}" stroke-linecap="square">
<path d="M6 23a10 10 0 0 1 20 0"/><path d="M2 23h28"/>
<path d="M16 4v4"/><path d="M5.5 8.5l2.8 2.8"/><path d="M26.5 8.5l-2.8 2.8"/></g>
<g fill="none" stroke="${b}" stroke-width="${w}"><path d="M2 28h10"/><path d="M20 28h10"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M0 0h24l8 8v24H0z" fill="${t.accSoft}"/>${SUNRISE(t.acc, t.sun, 2.2)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 48"><path d="M0 0h246l14 14v34H0z" fill="${t.card}"/><g transform="translate(9,8)">${SUNRISE(t.acc, t.sun, 2.2)}</g><text x="52" y="27" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">솔레이스바디</text><text x="52" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">SOLACEBODY</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<path d="M56 56h1016l72 72v446H56z" fill="${t.card}"/>
<g transform="translate(100,112) scale(3.2)">${SUNRISE(t.acc, t.sun, 2.2)}</g>
<text x="104" y="330" font-family="system-ui,sans-serif" font-size="52" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="104" y="392" font-family="system-ui,sans-serif" font-size="28" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="104" y="438" font-family="ui-monospace,monospace" font-size="22" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<path d="M104 472h420l18 18v54H104z" fill="${t.acc}"/>
<text x="140" y="500" font-family="ui-monospace,monospace" font-size="15" letter-spacing="4" fill="${t.accSoft}">${cfg.telLabel}</text>
<text x="140" y="530" font-family="ui-monospace,monospace" font-size="27" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'solace.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'solace.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const SUNMARK = (t = THEME) => `<svg class="smk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${SUNRISE(t.acc, t.sun, 2.2)}</svg>`;
