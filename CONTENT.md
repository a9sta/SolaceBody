# 문구를 고칠 때

| 자리 | 파일 |
|---|---|
| 동·구·시도 리드 문단 | `src/content/copy.mjs` (`SPOT_LEAD_A/B/C`, `GU_LEAD`, `SIDO_LEAD_*`) |
| 접수 다섯 걸음 · 주의 · FAQ | `src/content/copy.mjs` (`STEP_SETS`, `NOTICE`, `FAQ_POOL`) |
| 섹션 제목·부제 | `src/content/copy.mjs` (`SEC`) |
| 롱테일 앵커 | `src/content/copy.mjs` (`ANCHOR`) |
| 타이틀·디스크립션 | `src/lib/seo.mjs` |
| 코스 이름·값·설명 | `data/courses.json` |
| 일지 글 | `src/content/posts.mjs` |
| 약관·방침 전문 | `src/pages/site.mjs` (`TERMS`, `PRIVACY`) |
| 디자인(CSS·SVG) | `src/assets.mjs` |

## 고친 뒤 꼭 돌리는 것

```
npm run build && npm run check
python3 /root/msg-daily/netlify-dupcheck.py  dist <다른사이트>/dist   # 문장 겹침 0
python3 /root/msg-daily/netlify-skelcheck.py dist <다른사이트>/dist   # 골격 겹침 0
python3 /root/msg-daily/xdup-source.py . <다른사이트> ...             # 겹친 소스 줄 역추적
```

★**앞 사이트 틀을 가져오면 문구가 천 쪽 넘게 따라온다.** 처음 측정이 1,007건이었다.
`xdup-source.py` 로 고칠 소스 줄을 바로 찍어 세 패스에 0으로 내렸다.
한 리터럴에 두 문장이 있으면 그중 하나만 겹쳐도 잡아야 한다.
