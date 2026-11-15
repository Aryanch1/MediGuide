# MediGuide — Design Spec

**App:** MediGuide — medicine labels explained in plain language, with a reminder schedule.
**For:** caregivers, elderly people, and anyone who finds prescription instructions confusing.
**Theme:** one calm teal `#0E7C7B` (deep `#085250`, light `#1FA8A4`, soft `#D3EFEA`, pale `#E9F7F5`) on soft light surfaces over a mint/cream aurora gradient.
**Display font:** Sora 700/800 (bundled via `@expo-google-fonts/sora`) for headlines, screen titles and big numbers; system font for body.
**Figma:** https://www.figma.com/design/0FIqvwkTT1AmYzPLsINlO8 — "MediGuide — Daily App" (Tokens & Components page + 8 screen frames, populated 2026-11-15).

## Design tokens (lib/theme.ts)

- Palette: teal primary + teal-tinted neutrals; warning amber for the medical disclaimer; error red.
- Radii: cards 30px, sheets 38px top, pills fully round, inputs 24px.
- Spacing: 8-point grid (4/8/16/24/32/48).
- Shadows: soft card shadow, teal glow on primary CTA.
- Type scale: Display 42 (56 wide) / Title 24 / Subtitle 17 / Body 15 / Caption 12 / Label 11.
- Breakpoints: `<600` phones (single column) · `600–840` large phone / foldable folded · `840–1280` tablet / foldable unfolded (two-pane) · `≥1280` desktop centred shell (max 1120).

## Imagery layer (required, from day one)

Bundled photos in `assets/meds/` (generated, mint-styled, no readable label text):
`hero.jpg` (flat-lay of bottles, blister pack, glass of water), `tablets.jpg`,
`liquid.jpg` (syrup bottle), `cream.jpg` (ointment tube), `inhaler.jpg`,
`vitamins.jpg`. `lib/photos.ts` matches a photo to each explanation by
keyword over the medicine name + label text, with `tablets.jpg` as fallback.
No text-only card lists anywhere: every card and detail screen carries a photo.

## Screen inventory & flow

1. **Splash** — pale teal, capsule icon, "MediGuide".
2. **Welcome** (gate on every open for signed-out non-guests) — hero photo, headline "Know your medicine.", exactly four options: Continue with Google · Create account (name + email + password + confirm, match check) · Log in (email/password + Forgot password) · Continue without an account.
3. **Home** — hero photo ~40% of first viewport with frosted-glass panel carrying the display headline + primary CTA **on** the hero; label-input pill below; sample-label chips; category photo tiles (arch top radius 74px); Today's reminders (top 3); Recent history; Saved cabinet preview.
4. **Explain result** — full photo hero with content in a rounded-top sheet overlapping it (−48px); disclaimer banner; purpose / how-to / warnings; editable reminder schedule; Save CTA pill carrying the figure ("Save to cabinet · 3× a day").
5. **Medicine detail** (`/medicine/[id]`) — same sheet-over-hero layout for a saved or current explanation; saved reminders editable in place.
6. **Cabinet** — saved medicines (photo cards) + History (one-tap re-open). Wide screens: two-pane split — list left, detail right.
7. **Reminders** — today's doses, soonest first; big time numerals (28px Sora), medicine + dose, on/off chip per reminder.
8. **Settings / Profile** — avatar (client-side resized, stored on the user doc), display name, email + sign-in method, password-reset email, sign out; guest account card routing to Welcome; service status; version read from `app.json`.
9. **Help** — how it works (4 steps), what MediGuide is not, disclaimer, privacy.
10. **Empty/error states** — cabinet empty, reminders empty, no explanation yet, medicine not found, explain error with retry wording.

## Transition & animation plan

- App open: splash holds on pale teal until Sora loads; Home hero fades/slides in (spring).
- Welcome → Home: slide_from_right (expo-router stack default for the app).
- Home → Explain: after a successful explain, the result screen slides in; the Save button confirms in place ("Saved to your cabinet ✓" appears under the CTA where the user is looking).
- Cards/lists: staggered rise (`FadeInDown` + spring, 60–70ms stagger).
- Buttons: Reanimated spring press to ~0.95 with overshoot settle; glow tightens; light haptic on primary actions (mobile only).
- Chips: pop (scale bounce 1.18 → 1) when selected.
- Loading: bouncing dots inside the CTA; skeleton-free — the button itself animates, never freezes.
- Sheets: slide up over the hero; hero photo floats gently (aurora drift behind).
- Custom pull-to-refresh: a capsule filling with teal, scrubbed by pull distance (threshold 90px); on release it loops (liquid fill) while data returns, then content settles with a spring. On web the same capsule animates on the header refresh button.
- History "Use": re-opens the explanation on the Explain screen (new screen = visible feedback), with "Opening…" shown on the tapped row while it loads.

## 90% POC MATCH — visual self-check

Scored against the 8 shared rules in `DESIGN_REFERENCE.md` plus the 90% POC MATCH section. Honest estimates, 2026-11-15 (code review against the live `expo export` build; no live Vercel URL exists yet to screenshot at widths):

| Screen | Score | Notes |
|---|---|---|
| Home | ~90% | Hero ~40% viewport + frosted panel + CTA on hero; arch photo tiles; input pill; big display headline. Shortfall: hero photo is a flat-lay, not a portrait-led editorial shot. |
| Welcome | ~88% | Hero photo + frosted glass card + display headline; four options as pills. Shortfall: no arch tile on this screen. |
| Explain result | ~90% | Full photo hero + overlapping rounded-top sheet; disclaimer banner; key figure inside the Save pill. |
| Medicine detail | ~90% | Same sheet-over-hero pattern as Explain. |
| Cabinet | ~88% | Photo cards with arch tops; two-pane on wide. Shortfall: list rows are cards, not editorial tiles, on narrow widths. |
| Reminders | ~85% | Big-number times with quiet labels; glass rows. Shortfall: no photo hero on this screen (by design — a utility list). |
| Settings | ~85% | Glass cards, circular avatar, pill buttons. Shortfall: no imagery layer on this screen. |
| Help | ~85% | Same card system; shortfall: no hero image. |

Rules met everywhere: one theme color used with discipline; fully-round pills; 30px+ card radii; frosted glass (two-layer, Android-safe); Sora display type; generous whitespace; big bold numbers with quiet gray labels; spring motion throughout. Known gap vs the references: the POC pictures are fashion/commerce photography-led; MediGuide's imagery is pharmacy still-life, which fits its topic but is visually quieter — an accepted trade for a care app.

## Responsive

- `<600`: single column, full-width cards, hero ~40% viewport, tab bar floating pill.
- `600–840`: wider content cap (640), larger display type.
- `840–1280`: two-pane Cabinet (list 380px + detail); grids 2 columns; primary actions clear of the center crease.
- `≥1280`: centred shell (max 1120), hover states where natural, never a stretched phone UI.
- Every size: no horizontal scrolling, tap targets ≥44px, layouts reflow on resize/rotation without restart.

## FridgeToMeal lessons applied (never repeat)

1. Auth readiness: `auth.authStateReady()` awaited before marking auth-ready (lib/store.tsx).
2. Glass on Android: every frosted surface uses the two-layer structure (outer bg+shadow, inner overflow-hidden clips the blur) — see components/ui.tsx `GlassCard` and components/TabBar.tsx.
3. Deep links: `vercel.json` ships `"cleanUrls": true` from day one.
4. One version source: version lives only in `app.json`/`package.json`; Settings reads it via `expo-constants`.
5. Visible feedback: every state-changing tap confirms where the user is looking (save feedback, "Opening…", scroll-to-input focus, history re-open navigates).
