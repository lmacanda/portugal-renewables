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

## Next steps (not done yet)

- [ ] Load `public/data/dams.geojson` into a Mapbox map (reusing the
      Marker pattern from vinho-map)
- [ ] Wire up REN's generation-mix endpoint alongside the map (chart or
      HUD panel)
- [ ] Decide how "where" (dam map) and "how the mix changes" (REN chart)
      share the page
- [ ] Timeline scrubber synced across both, if time allows
- [ ] Narrative callouts (the storytelling layer)