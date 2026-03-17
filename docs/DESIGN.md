# Design System Specification: Editorial Mediterranean Engineering

## 1. Overview & Creative North Star
**Creative North Star: The Coastal Architect**
This design system avoids the generic SaaS look and instead builds a high-end, editorial product language shaped by **Mediterranean light, coastal depth, and engineering precision**. The interface should feel calm, premium, and structured — like a route carefully designed around sea, sun, and movement.

We reject the flat white web. Instead, we use **Layered Sophistication**: tonal depth, soft atmosphere, large-radius surfaces, and color fields that feel environmental rather than decorative.

The goal is to create a UI that feels **built**, not merely drawn — authoritative in structure, warm in tone, and unmistakably tied to Antalya / Akdeniz energy.

---

## 2. Color Theory & Tonal Geometry

### Canonical Brand Palette
- **Primary:** `#005696` — deep Mediterranean blue, the core trust color
- **Secondary:** `#FF8C00` — sun orange, the energetic accent
- **Tertiary:** `#00CEC9` — coastal teal, freshness and motion
- **Neutral:** `#F8F9FA` — soft cloud background, the main canvas

### Recommended Distribution
Use color with restraint:
- **60% Neutral / Surface**
- **20% Primary Blue**
- **12% Secondary Orange**
- **8% Tertiary Teal**

For auth, onboarding, and editorial surfaces, orange can become slightly more visible to introduce warmth — but only as an atmosphere layer, not as noise.

### The "No-Line" Rule
**Explicit Instruction:** Avoid using 1px solid borders for sectioning.
Boundaries must be defined through:
- tonal surface shifts
- spacing
- soft elevation
- layered color fields

Instead of a border, place a `surface_container_lowest` (`#FFFFFF`) card on a `surface` / `surface_container_low` base.
The transition between sections should feel like a change in material, not a line drawn by a tool.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1. **Base:** `surface` (`#F8F9FA`) — page canvas
2. **Sectioning:** `surface_container_low` (`#EEF3F6`) — large structural zones
3. **Content Hubs:** `surface_container_lowest` (`#FFFFFF`) — cards, forms, panels
4. **Prominence:** `surface_container_high` (`#E3EBF1`) — inset elements, emphasized surfaces

### The "Glass & Gradient" Rule
To give the product soul without becoming loud:
- **Primary actions:** subtle blue-led gradients, e.g. `#005696 → #0A3C63` or blue with a faint teal lift
- **Warm atmosphere layers:** orange should appear as a glow, bleed, or highlight field rather than a flat block everywhere
- **Floating navigation / overlays:** translucent white surfaces with backdrop softness so blue, orange, and teal tones can breathe underneath
- **Auth / marketing backgrounds:** layer orange + blue + teal on top of `#F8F9FA` to evoke sea and sunset without sacrificing clarity

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance warmth and technical precision.

- **Display & Headlines (Manrope):** the architectural voice; use large sizes with tight tracking for confident headlines
- **Body & Labels (Inter):** the functional voice; maximum readability for product content, forms, and data
- **Hierarchy Rule:** lead with contrast — strong headline, quieter supporting body copy, restrained labels

Typography should always support the layout’s rhythm; boldness should come from scale and spacing before weight alone.

---

## 4. Elevation & Depth: Tonal Layering
Traditional heavy shadows make the interface feel dirty. Prefer **ambient layering**.

- **Primary depth principle:** a white card on a soft neutral field already creates lift
- **Shadows:** use only when an element truly floats above others
- **Shadow color:** always tint from `on_surface`, never use pure black
- **Ghost Border fallback:** if accessibility requires an edge, use a very low-opacity tinted outline rather than a hard border

Recommended floating shadow:
- `box-shadow: 0 4px 6px -1px rgba(25, 28, 29, 0.04), 0 10px 15px -3px rgba(25, 28, 29, 0.08);`

---

## 5. Component Logic

### Buttons (The Energy Core)
- **Primary:** deep Mediterranean blue (`#005696`) with white text; may use a subtle blue-depth gradient on premium surfaces
- **Secondary:** sun orange (`#FF8C00`) for highlighted alternative actions, special promotions, or warm emphasis
- **Tertiary:** teal (`#00CEC9`) for lighter supporting actions and focused interactive states

Buttons should feel rounded, calm, and premium — never aggressive.

### Cards & Lists (The Engineering Grid)
- **Forbid Dividers:** no `<hr>`, no border-bottom sectioning
- Separate items with spacing and tonal contrast
- Use large radii: `12px–24px`
- Prefer white or near-white surfaces on soft neutral backgrounds

### Input Fields (The Precision Tools)
- **Track / field surface:** soft lifted neutral, never bright flat white unless inside a white card
- **Focus State:** use a teal aura derived from `#00CEC9`, not a hard electric border
- **Error State:** keep warning backgrounds softened and premium, never harsh or alarmist

### Signature Component: The "Data Sheet"
For structured route / place / engineering information:
- header labels in blue or muted secondary text
- values in stronger surface text
- no lines, only gutter spacing

---

## 6. Do’s and Don’ts

### Do:
- Use intentional asymmetry
- Let color behave like atmosphere, not paint buckets
- Use blue as the trust anchor
- Use orange as warmth and energy
- Use teal as freshness, focus, and motion
- Keep surfaces breathable and calm

### Don’t:
- Don’t use generic purple SaaS gradients
- Don’t default to fully white empty backgrounds
- Don’t draw hard borders between major sections
- Don’t cover every card with shadows
- Don’t let accent colors overpower readability

---

## 7. Spacing & Rhythm
The system runs on a 4px baseline, but layouts should prefer **wide breathability**.

- **Internal card padding:** `spacing.6` (`1.5rem`)
- **Major section gap:** `spacing.16` (`4rem`)
- **Auth / hero compositions:** allow larger atmosphere fields and more negative space so the background can feel environmental rather than flat
