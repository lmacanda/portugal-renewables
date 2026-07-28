# Portugal Renewables Map — Progress Log

**Goal:** portfolio project for Octopus Energy's Data Visualisation role
(React/Next.js, Mapbox, storytelling with real energy data). Built
step-by-step, together, rather than handed over pre-made.

**Repo folder:** `portugal-renewables/` (Next.js + TypeScript)

---

## The idea, in one line

Map Portugal's hydro dams (real locations) alongside REN's live national
generation mix (hydro, solar, wind, gas...), to tell the story of how
Portugal's electricity mix shifts over a day — where the water is, and
how the mix breathes as the sun and wind change.

## How we got here (in case future-you wonders "why this and not that")

- Started from an Octopus Energy job post + a screenshot of a similar
  Octopus dashboard (bubbles on a map, timeline scrubber, live data).
- First explored the **UK** Carbon Intensity API as a training-wheels
  version (Phase 1 of an earlier roadmap) — parked for now in favour of
  a Portugal-specific version, which is a better fit for this portfolio
  (local relevance + still directly comparable to the job's own domain).
- Considered a national-mix-only version (chart, no real map — "Path A")
  vs. a version with real dam locations on an actual map ("Path B").
  **Chose Path B** — harder, but closer to the actual job: combining two
  mismatched real-world datasets into one story, not just charting one
  clean API.

## Data sources decided on

1. **REN DataHub** — `https://servicebus.ren.pt/datahubapi/electricity/ElectricityProductionBreakdownDaily?culture=en-US&date=YYYY-MM-DD`
   Free, no key. Gives a full day's generation mix (Hydro, Solar, Wind,
   Natural Gas, Biomass, Coal, Import/Export with Spain, etc.) in 15-min
   intervals (96 points/day). **Important quirk:** it's a *day-in-review*
   endpoint, not live-right-now — today's date returns "No data found"
   until the day is complete. Yesterday's date works.

2. **SNIRH dam locations** (via Portugal's open data portal,
   `dados.gov.pt` → "Atlas da Água - Albufeiras") — a shapefile with 236
   dam points across Portugal, including `latdd`/`longdd` (plain
   WGS84, ready for Mapbox — no reprojection needed).

3. **Plano Nacional de Barragens (2007 PDF)**, uploaded by hand, used
   only to cross-check one filtering decision (see below).

## Key decisions made along the way (and why)

- **Read the shapefile in mapshaper.org**, exported the attribute table
  as CSV rather than exporting straight to GeoJSON — writing our own
  filter/convert script was better practice than a one-click export.
- **`aespanha` field is *not* "located in Spain."** Alqueva (fully inside
  Portugal) is flagged `'S'` — the field more likely marks whether a
  dam's basin is shared with Spain under the Albufeira Convention
  (Douro, Tejo, Guadiana, Lima, Minho). Not used as a filter.
- **Filtering out unbuilt/planned dams:** some entries have "(prevista)"
  in the name (e.g. "Almourol (prevista)"), but that tag isn't applied
  consistently — "Alvarenga" has no such tag but also `ano_ifunc == 0`.
  Cross-checked Alvarenga against the 2007 national dam plan PDF, which
  lists it under "Analisada" (studied/candidate site) alongside another
  confirmed-unbuilt dam — supporting `ano_ifunc == 0` as the filter rule.
  **Caveat, stated honestly rather than hidden:** the PDF is from 2007;
  some "planned" dams may have been built since. Status not re-verified
  against anything more recent.
- **Result:** 236 raw dam records → **162 kept** as built dams (74
  excluded as unbuilt/planned).

## Steps completed

1. ✅ Scaffolded a fresh Next.js + TypeScript project (`create-next-app`)
2. ✅ Downloaded SNIRH dam shapefile, inspected in mapshaper.org
3. ✅ Exported attribute table as CSV (`data/raw/dams.csv`)
4. ✅ Wrote `scripts/build-dams-geojson.ts`:
   - reads the CSV (`fs.readFileSync`)
   - parses it (`papaparse`, `header: true`, `dynamicTyping: true`)
   - filters out unbuilt dams (`ano_ifunc !== 0`)
   - maps surviving rows into GeoJSON `Feature`s (`[longdd, latdd]` —
     mind the lon/lat order) with properties: name, basin, district,
     municipality, year operational, dam type
   - writes `public/data/dams.geojson` (after `fs.mkdirSync(..., {
     recursive: true })`, since `writeFileSync` won't create folders)
5. ✅ Verified output: 162 features, sane coordinates, real names —
   ran with `npx tsx scripts/build-dams-geojson.ts`

## What we learned along the way (skills, not just steps)

- Difference between the **terminal** (runs commands) and the **editor**
  (where code actually lives) — code typed straight into PowerShell
  doesn't do anything.
- Reading a real, undocumented government dataset critically — field
  names aren't always what they sound like (`aespanha`), and cleanup
  filters need a real reason, not just a guess.
- `.shp` → CSV/GeoJSON pipeline via mapshaper.
- Node scripts run top-to-bottom — order of operations bugs (create
  folder *before* writing into it) are a common, easy-to-spot-once-shown
  class of bug.

  ## Step 6 — Dams rendered on Mapbox ✅

- Installed `mapbox-gl` + `@types/mapbox-gl`
- Created `.env.local` with `NEXT_PUBLIC_MAPBOX_TOKEN` (same Mapbox
  account as vinho-map)
- Built `components/DamsMap.tsx`: initializes a Mapbox map centered on
  Portugal, fetches `public/data/dams.geojson` on load, loops through
  features and drops a `mapboxgl.Marker` + popup (name, basin,
  municipality, district) for each dam
- Typed the GeoJSON shape properly instead of using `any` — added
  `export interface DamFeature` in `types.ts` (root level, sibling to
  `app/`), imported into `DamsMap.tsx`

  ## Step 7 — Generation mix chart + two-panel layout ✅

- Created `app/api/generation-mix/route.ts`: proxies REN's
  `ElectricityProductionBreakdownDaily` endpoint server-side (avoids
  CORS), takes a `?date=YYYY-MM-DD` query param
- Added `lib/dates.ts` → `yesterdayDateString()`, since REN's endpoint
  is a "day in review," not live-right-now — today's date returns
  "No data found" until the day is over
- Added `lib/reshapeGenerationMix.ts` — pivots REN's column-oriented
  response (`xAxis.categories` + `series[].data`, shaped for
  Highcharts) into row-oriented data (`[{ time, Hydro, Solar, Wind,
  ... }, ...]`), which is what recharts wants
- Built `components/GenerationMixChart.tsx` — stacked `AreaChart`
  (recharts) showing Hydro / Solar / Wind / Natural Gas only, colored
  to match REN's own scheme (green hydro+wind, amber solar, grey gas)
  rather than arbitrary hues
- **Scoped down on purpose:** left out Consumption, Import/Export
  (Spain interconnection), and Pumping for now — stacking 7-8 series at
  once would be noise; those are a planned addition, not forgotten
- Split layout into two separate divs (map, chart) using flexbox
  (`flexDirection: column`, map div `flex: 1`) rather than the chart
  floating on top of the map — simpler, own regions each

### Bugs / gotchas hit

- Map div needs `width/height: 100%` (fill its flex container) once it
  stopped being full-viewport — `100vw/100vh` made it ignore the layout
  and cover the chart panel underneath it

**Result:** map on top, generation-mix stacked area chart underneath,
both showing real data end to end.

### Bugs hit + fixed (real ones, worth remembering)

- **`fs.writeFileSync` failing with ENOENT** — it won't create missing
  folders. Fix: `fs.mkdirSync(path, { recursive: true })` *before*
  writing (and in the right order — mkdir has to run first).
- **Confusing the terminal with the code file** — JS/TS code
  (`fs.writeFileSync(...)`) only means something inside a `.ts` file run
  by Node; typing it directly into PowerShell just errors, since
  PowerShell doesn't know JavaScript.
- **"File is not a module"** — an `interface` with no `export` in front
  of it is invisible to other files. Fix: `export interface DamFeature`.
- **Mapbox token error despite `.env.local` "existing"** — the file was
  actually named `env.local` (missing the leading dot), so Next.js
  never found it. `.env.local` must start with a literal dot.
- **Hydration warning about `cz-shortcut-listen`** — caused by a browser
  extension injecting an attribute into `<body>` before React loads;
  unrelated to the app itself. Silenced with `suppressHydrationWarning`
  on the `<body>` tag in `layout.tsx`.

**Result:** dam markers render correctly on the map, clickable, showing
real name/basin/municipality/district per dam.

Step 8 — Chart labels, date picker, capacity-sized dam markers, dams list ✅
Chart X-axis: interval={11} on recharts' <XAxis> → labels every 3 hours instead of all 96 fifteen-minute ticks
Date picker: date state added, useEffect now depends on [date] so changing the date actually refetches; "Yesterday" and "−7 days" quick-jump buttons via a small shiftDate() helper
Added capacity (reservoir storage, hm³, from SNIRH's compax_lag field) through the whole pipeline: CSV → build-dams-geojson.ts → types.ts → DamsMap.tsx. Named consistently as capacity everywhere — earlier drafts drifted across three different names (compax_lag, capacityLag, capacity) across three files, which was the actual bug for a while, not the code logic itself
Dam markers now sized by Math.sqrt(capacity) (not raw value) so area, not diameter, scales proportionally with capacity — the correct way to size circles by a quantity
Split page layout: left sidebar (dams list, 320px) + right column (map on top, chart below) — nested flexbox, outer row / inner column
Built components/DamsList.tsx: sorted by capacity descending, hover highlight per row, column header row (Name / Type / Capacity) with a divider line, small project title above the list

Bugs hit + fixed
Mapbox rendering a split/fragmented map after adding the sidebar — Mapbox sizes its canvas once at creation and doesn't auto-detect its container resizing afterward. Fixed with a ResizeObserver on the map container calling map.current.resize(), cleaned up via resizeObserver.disconnect() in useEffect's return.
useEffect cleanup placed too early, killing the rest of the effect — a bare return () => {...} immediately exits the function; had to move it to the very end, after everything else runs once.
Import statement had the right file but the wrong name — import DamsList from ".../DamsMap" legally imports the map component but labels it DamsList in that file; nothing checks that the alias matches the component's real purpose. Explains why the sidebar showed a fragment of the map instead of a list.

Result: left sidebar lists all dams (sorted, hover-highlighted), map shows capacity-sized/colored circles, chart has readable hour labels and a working date picker with quick-jump buttons.

## Next steps / ideas (not yet built)

- [x] Load `public/data/dams.geojson` into a Mapbox map (reusing the
      Marker pattern from vinho-map)
- [x] Wire up REN's generation-mix endpoint alongside the map (chart or
      HUD panel)
- [x] Decide how "where" (dam map) and "how the mix changes" (REN chart)
      share the page

- [X] **Chart hour labels** — currently hidden (`XAxis hide`); need to
      decide which of the 96 fifteen-minute ticks to actually show
      (e.g. every 4 hours) so it's readable without clutter
- [X] **Dam markers on Mapbox** — still plain default pins; open
      question on what should encode meaning (size by reservoir
      capacity? color by basin? cluster at low zoom levels?) — needs a
      decision before building
- [ ] **Add Import/Export (Spain interconnection), Consumption, and
      Pumping**
      - [X] **Capacity on hover** — show the number when hovering a map
      circle (via popup or tooltip), rather than as its own list
      column; keep a small de-emphasized capacity value in the list
      too for scanning/reference
- [X] **Narrative link between map and chart** — right now they're two
      disconnected widgets. Ideas, cheap → involved:
      1. Visual emphasis: give Hydro's band in the chart a bolder
         stroke/full opacity, mute Solar/Wind/Gas slightly, so the
         "mapped" source stands out from the rest of the national mix
      2. A short caption near the chart explaining the connection
         ("Hydro, mapped left, vs. the rest of the national mix")
      3. Real interactivity: hovering a dam on the map highlights the
         Hydro band in the chart at that moment (or the reverse) — same
         underlying "linked views" mechanism as the list↔map hover idea
         below; worth designing both together rather than separately
- [ ] **Hover a row in the list → highlight the matching dam on the
      map** (and/or the reverse) — needs shared state lifted above both
      components, not yet designed
- [ ] **"Reveal dams by year" button** — animate dams appearing on the
      map ordered by `yearOperational` instead of all-at-once; turns
      the map into a genuine history-of-the-grid narrative. Good
      candidate for the storytelling layer, optional/toggleable rather
      than the default view
- [X] Dam marker photos (Wikimedia Commons, where available — most of
      the 162 won't have one)
- [ ] MW generation capacity (vs. current reservoir-volume capacity),
      if a usable source is found
- [ ] Add Import/Export (Spain interconnection), Consumption, Pumping
      to the chart as an optional layer
- [ ] OpenStreetMap / Open Infrastructure Map power plants — Portugal
      has 1,607 mapped power plants (24,277 MW) with real locations;
      could close the "why only dams are mapped" gap for wind/solar/gas
- [ ] Renewable % of total generation — one stat, or a treemap variant,
      computed from data already in hand
- [ ] Timeline scrubber synced across map + chart