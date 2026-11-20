# Growing Eco – nowa strona (PL / EN / DE)

Statyczna strona generowana prostym skryptem Node (bez zależności).

- `content.mjs` – wszystkie teksty i dane (3 języki)
- `build.mjs` – generator HTML → `dist/` (PL w katalogu głównym, `/en/`, `/de/`)
- `assets/` – style i skrypty (animacja ciężarówki w hero)
- `serve.mjs` – lokalny podgląd

## Lokalnie

```
node build.mjs
node serve.mjs        # http://localhost:5174  (lub PORT=5175 node serve.mjs)
```

## Cloudflare Pages

- Framework preset: **None**
- Build command: `node build.mjs`
- Build output directory: `dist`
