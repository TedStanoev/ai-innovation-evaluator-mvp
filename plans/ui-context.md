# AIIE (AI Innovation Evaluator) – UI Architecture & UX Blueprint

This document defines the complete User Interface (UI) layout, visual design system, interactive state transitions, and component specifications for the **AI Innovation Evaluator (AIIE)** frontend (`/client`). It is aligned with `/plans/design-context.md` (**Aura Acrylic / Hyper-Modern Glass**).

---

## 1. Visual Design System & Color Palette (Aura Acrylic / Hyper-Modern Glass)

The interface embodies a futuristic evaluation cockpit blending refined **Glassmorphism** (`plate-acrylic`) with an ambient "aurora" glow aesthetic over an airy cool slate canvas:
* **Typography:** Exclusively rendered in **Plus Jakarta Sans** (`400`, `500`, `600`, `700`, `800`) with tight letter-spacing (`tracking-tight`) and crisp numerals.
* **Canvas & Atmospheric Aurora (`#f1f6fc`):** Cool slate foundation layered with large blurred radial aurora light fields (`sky-300/25`, `teal-300/20`, `emerald-200/25` with `blur-3xl`).
* **Base Plate Glass (`plate-acrylic`):**
  * `background: rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(20px)`
  * Specular top/left border highlights (`rgba(255, 255, 255, 0.95)`) and faint cyan bottom/right borders (`rgba(186, 230, 253, 0.6)`)
  * Multi-stop colored ambient shadow: `0 24px 50px -12px rgba(13, 148, 136, 0.16), 0 10px 24px -6px rgba(14, 165, 233, 0.13), 0 0 0 1px rgba(255, 255, 255, 0.6) inset`
* **Primary Typography Colors:** `#0b1c30` (`on-surface` slate navy) for headings/metrics; `#64748b` (`text-slate-500` / `text-slate-400`) for labels and subtitles.
* **Chromatic Gradients & Accents:**
  * **Primary Teal:** `#0d9488`
  * **Secondary Sky & Cyan:** `#0ea5e9` / `#06b6d4`
  * **Emerald Accent:** `#10b981`
  * **Gradient Action Buttons & Active Tabs:** `bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500` with top specular highlight (`border-t border-white/40`) and teal drop glow (`rgba(13, 148, 136, 0.45)`).
* **Iconography Policy:** Every button uses **only a single vector icon** (Lucide React) paired with its text label—never combine an icon and an emoji on the same button.

### 4H Role Tints, Icons & Score Chips
Every participant slot inside a team card and every role badge across the platform is styled by their assigned 4H micro-role (no `disciplineSubtitle` is displayed):

| 4H Role | Lucide Icon | Member Row Surface | Icon Bucket | Score Chip Text |
| :--- | :--- | :--- | :--- | :--- |
| **Hacker** | `Code2` | `bg-sky-50/75 border-sky-100/90` | `bg-sky-100/90 text-sky-600` | `text-sky-600` |
| **Hipster** | `Paintbrush` | `bg-purple-50/75 border-purple-100/90` | `bg-purple-100/90 text-purple-600` | `text-purple-600` |
| **Hustler** | `Zap` | `bg-amber-50/75 border-amber-100/90` | `bg-amber-100/90 text-amber-600` | `text-amber-600` |
| **Hound** | `Lightbulb` | `bg-emerald-50/75 border-emerald-100/90` | `bg-emerald-100/90 text-emerald-600` | `text-emerald-600` |

---

## 2. Application Layout Structure

```text
+-----------------------+-----------------------------------------------------------------------+
|   FLOATING SIDEBAR    | FLOATING TOP HEADER & KPI ACRYLIC PLATE (`rounded-3xl plate-acrylic`) |
|  (`w-72 rounded-3xl`) | Title: Национален иновационен хакатон 2026 [Випуск]   [• Очаква потв.]|
|                       | [ Общо кандидати ]  [ Селектирани за участие ]  [ Сформирани отбори ] |
| [AIIE] AIIE Platform  +-----------------------------------------------------------------------+
|                       |            CENTERED FLOATING SEGMENTED PILL TABS:                     |
| [ Bot: AI Inspector ] |          (  Участници  |  [ Отбори (2) ]  |  Анкета  )                |
|                       |                                                                       |
| КОНКУРСИ              |                         MAIN WORKSPACE CONTENT                        |
| ⌄ Конкурс 1: Инова...●|        Side-by-Side 2-Column Acrylic Team Comparison Cards            |
| › Конкурс 2: FinTech  |        (Top 6px chromatic stripe, Compatibility %, 4H Roster)         |
| › Конкурс 3: Green... |                                                                       |
|                       |                                                                       |
| --------------------- |                                                                       |
| (ЕР) Д-р Елена Ростова|                                                                       |
+-----------------------+-----------------------------------------------------------------------+
```

### 2.1. Left Sidebar (`w-72` Floating Acrylic Column)
* **Container:** Floating `rounded-3xl plate-acrylic` column separated from the viewport edges by outer shell padding.
* **Top Branding:**
  * Saturated gradient square badge (`h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500`) with white **`AIIE`** label and sky/cyan drop glow.
  * Title **`AIIE Platform`** (`text-[#0b1c30] font-extrabold`) and subtitle **`AI Innovation Evaluator`** (`text-[#0d9488] font-semibold`).
* **AI Inspector Trigger (Directly below Branding):**
  * Soft mint-tinted pill card (`rounded-2xl bg-gradient-to-r from-white/95 via-teal-50/40 to-emerald-50/60 border border-teal-200/70`) with `Bot` icon, **`AI Inspector`** label, live pulsing indicator dot when agents are running, and a pill badge (`bg-teal-100/90 text-[#0d9488]`) showing the logged thoughts count (e.g., `15`).
  * Clicking toggles the right-hand slide-over **AI Thought Process Drawer**.
* **Contests Navigation (`КОНКУРСИ`):**
  * Vertical stack of contests bound to the `evaluations` collection.
  * Active contest item uses `rounded-2xl bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/70 border border-teal-200/80 text-[#0b1c30] font-bold`, a `ChevronDown` icon on the left, and a glowing teal dot (`bg-[#0d9488] ring-4 ring-teal-400/25`) on the right.
  * Inactive contests use a `ChevronRight` icon and muted slate typography (`text-slate-500`).
* **Bottom Footer:**
  * Gradient circular avatar badge (`ЕР` in `bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500`), admin name (**`Д-р Елена Ростова`**), green status dot + **`Admin`** role label, and `LogOut` icon button.

### 2.2. Top Header & Triple KPI Acrylic Plate
* Housed inside a unified `rounded-3xl plate-acrylic p-6` container:
  * **Header Row:** Contest Title (`headline-xl` / `font-extrabold text-[#0b1c30]`), edition pill badge (`Випуск 2026 • Пролет`), and right-aligned status pill badge (e.g., `Очаква потвърждение` in `bg-amber-50/95 border-amber-200/80 text-amber-700` with glowing amber dot).
  * **Triple Metric KPI Cards (`grid-cols-1 sm:grid-cols-3 gap-5`):**
    1. **Общо кандидати:** Numeric value + saturated cyan-to-sky gradient icon square (`Users` icon).
    2. **Селектирани за участие:** Numeric value + `(лимит 96)` + saturated sky-to-blue gradient icon square (`TrendingUp` icon).
    3. **Сформирани отбори:** `{confirmed} / {total}` + `потвърдени` (`text-[#0d9488]`) + saturated teal-to-emerald gradient icon square (`CheckCircle2` icon).
  * *(Note: Do NOT display TBI spread/difference metrics in this top KPI bar.)*

### 2.3. Centered Segmented Control Tabs
Centered horizontally below the header plate, a floating frosted pill cradle (`bg-white/90 backdrop-blur-xl p-1.5 rounded-full inline-flex items-center gap-1 border border-white shadow-[0_14px_34px_-8px_rgba(13,148,136,0.16)]`) houses three pill tabs:
1. **`Участници`** (`Users` icon)
2. **`Отбори`** (`UserCheck` icon + team count pill badge)
3. **`Анкета`** (`FileText` icon)

Active tab styling: `rounded-full px-5 py-2 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 text-white font-bold shadow-[0_6px_18px_-3px_rgba(13,148,136,0.5)]`.

---

## 3. Tab Views & Interactive Workflows

### 3.1. Tab 1: `Участници` (Participants Table)

#### Top Control Bar (`rounded-3xl plate-acrylic`):
* **Left:** Gradient icon badge (`Users`) + **`Общ брой участници: {totalCount}`**
* **Center/Right Controls:**
  * **Search Input (`Търсене`):** Rounded-full input filtering dynamically by name, email, school/organization, or class.
  * **Sort Dropdown (`Сортиране`):** Rounded-full selector for `TPS бал (Низходящо)`, `Име (А-Я)`, `Успех`, or `Роля`.
  * **Primary Action Button:** **`Профилирай`** (`Sparkles` icon, gradient pill `from-sky-500 via-teal-500 to-emerald-500`).

#### Data Table Columns (`rounded-3xl plate-acrylic` with 6px top gradient stripe):
1. **`Име`** (Full Name)
2. **`Имейл`** (Email address)
3. **`Училище и клас`** (School/Organization & Grade/Position)
4. **`Успех и проекти`** (GPA value + extracurricular project count, e.g., `5.85 • 3 проекта`)
5. **`Индекси`** (Compact pills for `AI`, `EI`, `INI`, `ENI`, `MI`) — displays `"-"` until profiled.
6. **`TPS бал`** (White pill insert with colored numeric score + `TPS`) — displays `"-"` until profiled.
7. **`Роля`** (Color-coded 4H pill badge with role icon) — displays `"-"` until profiled.
8. **`Анкета`** (Rounded-full ghost button with `FileText` icon: **`Виж отговори`**) — opens the raw questionnaire modal.

#### Pagination / Load More:
* Displays **16 participants per page/batch** by default, with a centered **`Зареди още ({remaining})`** pill button when `> 16`.

---

### 3.2. Agent Execution Flow (`Профилирай` Button Trigger)

1. **API Dispatch:** Sends `POST /api/evaluations/start` (`HTTP 202 Accepted`).
2. **Immediate Tab Switch:** Switches active tab to **`Отбори`**.
3. **Auto-Open AI Inspector:** Slides open the right-hand **`AI Inspector`** acrylic drawer streaming live `agent_thoughts`.
4. **Centered Processing State:** Displays a centered acrylic card with an animated gradient spinner:
   > **"Екипите се обработват от агентите. Моля, изчакайте..."**
5. **Sequential Card Reveal:** Team cards animate onto the grid one by one (`animation-delay: index * 120ms`).

---

### 3.3. Tab 2: `Отбори` (Side-by-Side Acrylic Team Comparison Cards)

Teams are rendered in a 2-column side-by-side comparison grid on desktop (`grid-cols-1 lg:grid-cols-2 gap-6`).

#### Interactive Card Hover & Click-to-Expand Behavior:
* Every collapsed team card is a `rounded-3xl plate-acrylic plate-acrylic-hover cursor-pointer` container topped with an edge-to-edge **6px (`h-1.5`) chromatic gradient stripe** (`from-sky-400 via-teal-400 to-emerald-400` / `from-cyan-400 via-sky-500 to-blue-500`).
* Hovering smoothly transitions (`scale`, `transform`, `box-shadow` with `cubic-bezier(0.16, 1, 0.3, 1)`) the card scale (`hover:scale-[1.015]`) and elevates its tinted teal/sky shadow dispersion.
* Clicking a **collapsed** card expands it into the full-row analytical view (`!isExpanded`), while all nested buttons (`Потвърди`, `Промени`, `Смени`, `Разгъни`, `Свий`) call `e.stopPropagation()`. Clicking the card while it is already **expanded** does **not** shrink it—only clicking **`Свий`** collapses it.

#### A. Collapsed Card State (Default Comparison View)
* **Header Row:**
  * Team Pill (`Отбор 01` with glowing cyan/teal dot) + Status Pill (`Непотвърден` in amber with dot, or `Потвърден` in emerald with dot).
  * Right-aligned **`Разгъни`** ghost pill button (`ExternalLink` icon).
* **Compatibility Gauge Section:**
  * Left label with `ShieldCheck` icon: **`Съвместимост`**; Right percentage: **`93.7%`** (`font-extrabold text-[#0d9488]` / `text-sky-600`).
  * Full-width neon gradient progress bar (`h-1.5 rounded-full`) with glowing shadow (`shadow-[0_0_10px_rgba(45,212,191,0.55)]`).
* **Stacked 4-Member Roster:**
  * Each member row is a soft-tinted `rounded-2xl` surface (`Hacker`, `Hipster`, `Hustler`, `Hound`) displaying:
    * Left: Rounded-xl colored icon bucket (`Code2`, `Paintbrush`, `Zap`, `Lightbulb`) and **Participant Full Name** (no discipline subtitle).
    * Right: Elevated white pill insert (`bg-white border border-slate-200/80 rounded-lg px-2.5 py-1`) displaying their colored numeric score + **`TPS`** label (e.g., `79.6 TPS`).
  * When edit mode (`Промени`) is active on the card, a compact **`Смени`** pill button (`ArrowLeftRight` icon) appears beneath each member row.
* **Bottom Action Toolbar (when `status === "unconfirmed"`):**
  * Right-aligned pill buttons:
    1. **`Промени`** (`Pencil` icon, secondary ghost pill button).
    2. **`Потвърди`** (`Check` icon, vibrant gradient action pill `from-sky-500 via-teal-500 to-emerald-500` with teal glow).

#### B. Expanded Card State (`col-span-full` Detailed View)
* Expands across the full row width (`col-span-full`) within the same `rounded-3xl plate-acrylic` container and top 6px chromatic stripe:
  * **Top Header Row:**
    * **Top-Left:** Team pill, Status badge, and `4H Иновационен Отбор (4 членове)` pill (with no explanatory paragraph below the pills).
    * **Top-Right:** Action buttons (`Потвърди` when unconfirmed, and `Свий`; the `Промени` button is omitted in the expanded view).
  * **Telemetry & Compatibility Strip:** Displays `Съвместимост` percentage, `TBI` score, `4H Пълен`, `Среден TPS`, `Разнообразие`, formula summary, and full-width compatibility progress bar.
  * **4-Column Member Breakdown Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`):**
    * Displays each member's role badge with icon (`Code2`, `Paintbrush`, `Zap`, `Lightbulb`), white `TPS` pill insert, Full Name (without discipline subtitle), School & Grade, 5-index mini progress bars (`AI`, `EI`, `INI`, `ENI`, `MI`), and a **`Смени`** button always visible below each member when the team is unconfirmed (hidden once confirmed).
    * **Strengths (`Силни страни`) Section:** Renders member strengths as a vertical list using **checkmarks** (`Check` icon) instead of bullet points, followed by **Leading Indices (`Водещи индекси`)** rendered as color-coded **pills**.

---

### 3.4. Member Swap Workflow (`Промени` $\rightarrow$ `Смени` $\rightarrow$ Modal)

1. Clicking **`Промени`** on an unconfirmed team card reveals **`Смени`** buttons under each member.
2. Clicking **`Смени`** opens the acrylic modal **`Размяна на участник – Роля: {Role}`** showing the selected member at the top and a table of all other contest participants sharing the exact same 4H role (`Участник`, `Училище и клас`, `TPS бал`, `Текущ отбор`, and **`Размени`** button).
3. Clicking **`Размени`** swaps the two participants, recalculates `averageTPS`, `diversityScore`, `compatibilityPercentage`, and `teamBalanceIndex` for both teams, and updates the UI and Firestore.

---

### 3.5. Tab 3: `Анкета` (Questionnaire Intake Form)

* Rendered inside a `rounded-3xl plate-acrylic` container with a 6px top chromatic stripe and 3 grouped card sections (`Част 1: Обща информация`, `Част 2: Профил на кандидата`, `Част 3: Ситуационни въпроси за екипна работа`) and a gradient **`Подай анкета`** submit button.
