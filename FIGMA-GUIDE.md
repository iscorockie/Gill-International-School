# Figma UI Kit & Design System — Gill International School

This directory contains `figma-ui.html`, an HTML file specifically structured and formatted for **viewing and editing directly in Figma** using standard Figma plugins or browser inspection.

---

## 🎨 What is `figma-ui.html`?

Unlike standard websites that may contain heavy scripts or megabytes of base64 blobs, `figma-ui.html` is an ultra-clean, modular, lightweight file designed to translate directly into **native Figma Auto-Layout frames, styles, and editable layers**:

1. **Artboard #01 — Design System & Tokens (`1200px`)**:
   - **Color Palette Tokens**: Primary Maroon (`#8C2429`), Deep Burgundy (`#3B0D10`), Ink Maroon (`#2A090C`), Periwinkle Light (`#EDF1FC`), Periwinkle Accent (`#C9D4F2`), Cambridge Gold (`#D4AF37`), Text Inks (`#1E222A`, `#333A48`), Borders, Canvas & Backgrounds.
   - **Typography Hierarchy**: Display Hero (54px), H1 (38px), H2 (28px), H3 (20px), Body Large (18px), Body Regular (16px), and Caption (12px) using **Sora** and **Inter** (Google Fonts available natively in Figma).
   - **Button & Badge Matrix**: Primary, Secondary Outline, Light on Dark, Pill Badges, and Status indicators.
   - **Form Controls**: Text inputs, Select dropdowns, Active/Focus states with brand glow.

2. **Artboard #02 — Desktop UI Layout (`1440px`)**:
   - Complete responsive landing page for Gill International School:
     - Notification Top Bar with contact info & Parent Portal link
     - Sticky Header with brand crest, navigation links, and action buttons
     - Hero Section with high-impact Cambridge badge, headline, dual CTAs, and campus photo card
     - 4-Column Key Metrics Ribbon (100% Pass Rate, 15:1 Ratio, 25+ Nationalities, Ages 3–19)
     - 4 Core Pillars (Christ-Centred, Cambridge Rigour, Holistic Co-Curricular, Safe Campus)
     - 5 Cambridge Academic Stages (Early Years, Primary, Lower Secondary, IGCSE, AS/A Levels)
     - Beyond the Classroom Facilities Grid (Science Labs, Sports Pitch, Performing Arts, Community)
     - 4-Step Admissions Process Banner & Download CTA
     - Parent & Student Testimonials (3 Cards)
     - Campus Visit Booking Form & Location Cards
     - Comprehensive School Footer

3. **Artboard #03 — Mobile UI Layout (`390px iPhone 15/16`)**:
   - Mobile Dynamic Island bar, compact app header with quick dial and menu
   - Mobile hero with stacked action buttons
   - 2x2 Metric cards grid
   - Cambridge stage list
   - Sticky bottom action bar

---

## ⚡ How to Import and Edit in Figma

### Method 1: Using the `html.to.design` Figma Plugin (Recommended)
1. Open [Figma](https://www.figma.com/) and create or open a Figma design file.
2. In Figma, open **Plugins** (or press `Ctrl` + `P` / `Cmd` + `P`) and search for **`html.to.design`**.
3. Choose either:
   - **By URL**: Enter the live preview URL (or local URL `http://localhost:3000/figma-ui.html`).
   - **By HTML**: Select **"Import HTML code"**, open `figma-ui.html`, copy all the code, and paste it into the plugin.
4. Select viewport dimensions (e.g., Desktop `1440px` or full canvas) and click **Import**.
5. The plugin converts all HTML elements into native Figma **Frames**, **Auto-Layout**, **Text layers**, and **Vector shapes**!

### Method 2: Using the `Builder.io (HTML to Figma)` Plugin
1. In Figma, search for the **`Builder.io`** plugin.
2. Choose **Import from Web or HTML**.
3. Paste the URL or raw HTML code of `figma-ui.html`.
4. Click **Import to Figma** to generate editable layers.

### Method 3: Using the `html.to.design` Chrome Extension
1. Open `figma-ui.html` in Google Chrome (or from the live preview link).
2. Click the `html.to.design` browser extension icon.
3. Click **Send to Figma**.

---

## 🛠️ Viewing in Browser

To view the interactive multi-frame canvas with zoom controls, grid overlay, and artboard switcher:
- Run a static web server:
  ```bash
  python3 -m http.server 3000
  ```
- Navigate to:
  ```
  http://localhost:3000/figma-ui.html
  ```
- Use the top navigation bar to switch between **All Frames**, **Desktop (1440)**, **Mobile (390)**, or **Design System**, and toggle the 12-column layout grid.
