/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **하늘에 걸린 해의 자리**다. 땅의 모양을 재지 않는다.
 *   - 남중 시각 : 그 자리에서 해가 가장 높이 오르는 시각. 경도 1도마다 4분씩 밀린다.
 *   - 해돋이·해넘이 : 하지와 동지 두 날의 시각. 위도가 올라갈수록 여름 낮이 길어진다.
 *   - 낮의 길이 : 두 날의 차이. 같은 나라 안에서도 30분 넘게 벌어진다.
 *   - 북에서 몇째·동에서 몇째 : 쪽을 낸 칸을 위도·경도로 줄 세운 차례.
 *
 *   저녁과 새벽 방문에서 실제로 쓸모가 있다. 서쪽 칸은 같은 시각에도 아직 밝고,
 *   동쪽 칸은 벌써 어둑하다. 해가 진 뒤의 골목은 번지를 찾는 데 시간이 더 든다.
 *
 *   앞서 만든 아홉 사이트는 전부 **땅을 잰 값**(거리·방위·면적·행정동 수·끝과 끝·
 *   경계 맞닿음·가로세로·둘레·뭉침·안쪽 깊이·매듭점·시도 바깥선까지의 거리)이나
 *   **이름을 센 값**을 썼다. 해의 자리를 쓰는 축은 여기서 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 — 해의 자리를 내려면 중심점과 넓이는 있어야 한다 ─── */
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  let north = -90, south = 90, east = -180, west = 180;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
      if (idx === 0) {
        for (const c of ring) {
          if (c[1] > north) north = c[1];
          if (c[1] < south) south = c[1];
          if (c[0] > east) east = c[0];
          if (c[0] < west) west = c[0];
        }
      }
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky, north, south, east, west };
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 해의 자리 ─────────────────────────────────────────────
   NOAA 의 태양 위치 근사식을 그대로 옮겼다. 날짜를 고정해서 넣으므로
   몇 번을 다시 돌려도 같은 값이 나온다(같은 주소 = 같은 화면).
     γ      한 해를 한 바퀴로 본 각
     eqtime 균시차 — 시계의 정오와 해의 정오가 어긋나는 분
     decl   적위 — 해가 적도에서 남북으로 치우친 각
   표준시 자오선은 동경 135도이므로 우리나라에서는 남중이 늘 정오보다 늦다. */
const TZ = 9;
function solar(doy) {
  const g = (2 * Math.PI / 365) * (doy - 1 + 0.5);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  return { eq, dec };
}
/** 그 날 그 자리의 남중·해돋이·해넘이를 분 단위(한국 표준시)로 */
function sunOf(lat, lng, doy) {
  const { eq, dec } = solar(doy);
  const noon = 720 - 4 * lng - eq + TZ * 60;
  const cosH = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(dec)) - Math.tan(rad(lat)) * Math.tan(dec);
  if (cosH > 1 || cosH < -1) return { noon, rise: null, set: null, day: cosH > 1 ? 0 : 1440 };
  const ha = deg(Math.acos(cosH));
  return { noon, rise: noon - ha * 4, set: noon + ha * 4, day: ha * 8 };
}
const DOY = { 하지: 172, 동지: 355, 춘분: 79 };
/** 분 → '05:11:24' */
function hms(min) {
  const t = Math.round(min * 60);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
/** 분 → '14시간 47분' */
function hm(min) {
  const t = Math.round(min);
  return `${Math.floor(t / 60)}시간 ${t % 60}분`;
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
const vertex = new Map();                   // 옆 시군구를 거는 데만 쓴다
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const [sidoKey, meta, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    north: r4(st.north), south: r4(st.south), east: r4(st.east), west: r4(st.west),
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  /* ★읍은 쪽을 내지 않는다. 면과 함께 이름만 올린다. */
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
    north: r4(Math.max(...list.map((d) => d.north))),
    south: r4(Math.min(...list.map((d) => d.south))),
    east: r4(Math.max(...list.map((d) => d.east))),
    west: r4(Math.min(...list.map((d) => d.west))),
  };
  /* 시군구가 남북·동서로 얼마나 벌어져 있는가 */
  g.nsKm = r1((g.north - g.south) * 110.574);
  g.ewKm = r1((g.east - g.west) * 111.32 * Math.cos(rad(g.lat)));
  const gs = sunOf(g.lat, g.lng, DOY.하지);
  g.noon = hms(gs.noon);
  g.sunrise = hms(gs.rise);
  g.sunset = hms(gs.set);
  g.dayLen = hm(gs.day);

  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const su = sunOf(d.lat, d.lng, DOY.하지);
      const wi = sunOf(d.lat, d.lng, DOY.동지);
      const sp = sunOf(d.lat, d.lng, DOY.춘분);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        north: d.north, south: d.south, east: d.east, west: d.west,
        nsKm: r1((d.north - d.south) * 110.574),
        ewKm: r1((d.east - d.west) * 111.32 * Math.cos(rad(d.lat))),
        /* 해의 자리 — 하지·동지·춘분 세 날 */
        noon: hms(su.noon),
        noonLate: r1(su.noon - 720),             // 시계의 정오보다 몇 분 늦게 남중하나
        riseS: hms(su.rise), setS: hms(su.set), daySum: hm(su.day), daySumMin: Math.round(su.day),
        riseW: hms(wi.rise), setW: hms(wi.set), dayWin: hm(wi.day), dayWinMin: Math.round(wi.day),
        riseE: hms(sp.rise), setE: hms(sp.set),
        gapMin: Math.round(su.day - wi.day),     // 여름 낮과 겨울 낮의 차이(분)
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* ── 옆 시군구 — 길을 거는 용도. 숫자로 내세우지 않는다 ────── */
const touchPair = new Map();
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!touchPair.has(a)) touchPair.set(a, new Map());
      touchPair.get(a).set(b, (touchPair.get(a).get(b) || 0) + 1);
    }
  }
}
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) {
    const m = touchPair.get(c);
    if (!m) continue;
    for (const [n, cnt] of m) {
      if (cnt < 2) continue;
      const o = codeGu.get(n);
      if (o && o !== g) set.add(o);
    }
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* ── 전체에서의 차례 ──────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.lat - a.lat).forEach((s, i) => { s.nsRank = i + 1; });
spotAll.slice().sort((a, b) => b.lng - a.lng).forEach((s, i) => { s.ewRank = i + 1; });
spotAll.slice().sort((a, b) => a.riseS.localeCompare(b.riseS)).forEach((s, i) => { s.riseRank = i + 1; });
spotAll.slice().sort((a, b) => b.setS.localeCompare(a.setS)).forEach((s, i) => { s.setRank = i + 1; });
/* 위도 띠 — 0.02도(약 2.2km) 안에 다른 칸이 몇이나 함께 있나 */
{
  const band = new Map();
  for (const s of spotAll) {
    const b = Math.round(s.lat / 0.02);
    band.set(b, (band.get(b) || 0) + 1);
  }
  for (const s of spotAll) s.bandN = band.get(Math.round(s.lat / 0.02));
}
for (const g of guAll) {
  if (!g.spots.length) continue;
  g.spots.slice().sort((a, b) => b.lat - a.lat).forEach((s, i) => { s.guNsRank = i + 1; });
  g.spots.slice().sort((a, b) => b.lng - a.lng).forEach((s, i) => { s.guEwRank = i + 1; });
  const byLat = g.spots.slice().sort((a, b) => b.lat - a.lat);
  g.topSpot = byLat[0].name; g.topSpotSlug = byLat[0].slug;
  g.botSpot = byLat[byLat.length - 1].name; g.botSpotSlug = byLat[byLat.length - 1].slug;
  const byLng = g.spots.slice().sort((a, b) => b.lng - a.lng);
  g.eastSpot = byLng[0].name; g.eastSpotSlug = byLng[0].slug;
  g.westSpot = byLng[byLng.length - 1].name; g.westSpotSlug = byLng[byLng.length - 1].slug;
  /* 같은 시군구 안에서 해가 뜨고 지는 시각이 얼마나 벌어지나(초) */
  const rise = g.spots.map((s) => s.riseS).sort();
  const toSec = (t) => { const [h, m, x] = t.split(':').map(Number); return h * 3600 + m * 60 + x; };
  g.riseSpread = toSec(rise[rise.length - 1]) - toSec(rise[0]);
  g.noonFirst = g.spots.slice().sort((a, b) => a.noon.localeCompare(b.noon))[0].name;
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  const lat = r6(Y / A), lng = r6(X / A);
  const sn = sunOf(lat, lng, DOY.하지);
  const wn = sunOf(lat, lng, DOY.동지);
  const north = Math.max(...gus.map((g) => g.north));
  const south = Math.min(...gus.map((g) => g.south));
  const east = Math.max(...gus.map((g) => g.east));
  const west = Math.min(...gus.map((g) => g.west));
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  const early = allSpots.slice().sort((a, b) => a.riseS.localeCompare(b.riseS))[0];
  const late = allSpots.slice().sort((a, b) => b.setS.localeCompare(a.setS))[0];
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat, lng, area: r1(A),
    north: r4(north), south: r4(south), east: r4(east), west: r4(west),
    nsKm: r1((north - south) * 110.574),
    ewKm: r1((east - west) * 111.32 * Math.cos(rad(lat))),
    noon: hms(sn.noon), sunrise: hms(sn.rise), sunset: hms(sn.set),
    dayLen: hm(sn.day), dayWin: hm(wn.day), gapMin: Math.round(sn.day - wn.day),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    earlySpot: early ? early.name : '', earlyAt: early ? early.riseS : '',
    lateSpot: late ? late.name : '', lateAt: late ? late.setS : '',
    gu: gus,
  });
}

const north = spotAll.slice().sort((a, b) => b.lat - a.lat)[0];
const south = spotAll.slice().sort((a, b) => a.lat - b.lat)[0];
const east = spotAll.slice().sort((a, b) => b.lng - a.lng)[0];
const west = spotAll.slice().sort((a, b) => a.lng - b.lng)[0];

const out = {
  version: VERSION,
  source: '행정동 경계 admdongkor · CC BY 4.0 · 국가공간정보포털 원자료 · github.com/vuski/admdongkor',
  built: new Date().toISOString().slice(0, 10),
  axis: '해의 자리 — 남중 시각·해돋이·해넘이·낮의 길이',
  method: '중심점 좌표를 NOAA 태양 위치 근사식에 넣어 하지(6월 21일)·동지(12월 21일)·춘분(3월 20일) 세 날의 시각을 냈다. 날짜를 고정했으므로 다시 계산해도 값이 같다.',
  coverageFrom: '서울·인천·경기·부산은 동 한 칸마다 쪽을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구까지만 낸다. 읍과 면은 쪽을 만들지 않고 시군구 쪽에 이름만 올린다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    northName: north.name, northLat: north.lat,
    southName: south.name, southLat: south.lat,
    eastName: east.name, eastLng: east.lng,
    westName: west.name, westLng: west.lng,
    noonSpread: Math.round((east.lng - west.lng) * 4 * 60),   // 동쪽 끝과 서쪽 끝의 남중 차이(초)
    dayMax: Math.max(...spotAll.map((s) => s.daySumMin)),
    dayMin: Math.min(...spotAll.map((s) => s.daySumMin)),
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`북쪽 끝 ${C.northName}(${C.northLat}) · 남쪽 끝 ${C.southName}(${C.southLat})`);
console.log(`동쪽 끝 ${C.eastName}(${C.eastLng}) · 서쪽 끝 ${C.westName}(${C.westLng}) · 남중 차 ${C.noonSpread}초`);
console.log(`하지 낮 가장 긴 칸 ${C.dayMax}분 · 가장 짧은 칸 ${C.dayMin}분`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 하지 해돋이 ${s.sunrise} 해넘이 ${s.sunset} 낮 ${s.dayLen}`);
