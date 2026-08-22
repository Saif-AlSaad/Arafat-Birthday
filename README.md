# 🎂 Interactive Birthday Surprise Card

A magical, fully interactive birthday e-card for a 10-year-old brother.
Built with React + Vite + Tailwind + Framer Motion, and packaged as **one single
HTML file** so it can be hosted anywhere — including GitHub Pages — for free.

**Two complete cards are included.** Use the switcher pill in the bottom-left corner:

- **✨ Deluxe** *(default)* — full "Happy Birthday" band + buttery spring animations
- **💌 Classic** — the simpler envelope card

---

## ✨ Deluxe card (v2) — `src/v2/`

| Feature | Description |
| --- | --- |
| 🎵 **Real Happy Birthday song** | A full arrangement — music-box melody, walking bass, warm chord pad, shaker + kick — synthesised live with the Web Audio API. **Zero audio files.** Starts automatically when the present is opened. |
| 🎚️ **Music player** | Floating play/pause with a **live visualiser** driven by a real `AnalyserNode`, plus a volume slider |
| 🎁 **3D present intro** | Tap the box → it shakes, a **3‑2‑1 countdown** pops, the lid flies off, light bursts out |
| 🌊 **Buttery animations** | Framer Motion spring physics everywhere: per-letter 3D title, pointer parallax tilt, scroll-linked progress bar, staggered scroll reveals, drag-to-scroll cards |
| 🎤 **Blow out candles for real** | Optional microphone mode — actually blow at the screen and the candles go out one by one (tap fallback always works) |
| 🎆 **Fireworks engine** | Canvas rockets with sparkling exhaust and motion-blur trails |
| 🪙 **Scratch card** | Scratch off real gold foil with your finger to reveal a secret message |
| 💌 **Word-by-word letter** | Blur-to-focus stagger reveal on a taped notepad |
| 🎁 **Flip gift coupons** | 3D-flip boxes that stay locked until every candle is out |

## 💌 Classic card (v1) — `src/components/`

Sealed wax envelope → confetti cannons → rainbow title, typewriter letter,
tap-to-blow candles, a balloon-pop mini game and flip-to-open gift coupons.

---

## ✏️ Personalise it

Open **`src/config.ts`** and edit the values — name, age, who it's from, the letter,
the gifts (title + description + coupon code) and the "reasons you're awesome" list.
Nothing else needs to change.

```ts
export const config = {
  brotherName: "Aryan",
  age: 10,
  fromName: "Your Didi",
  headline: "HAPPY BIRTHDAY",
  letter: "Happy 10th birthday, little bro! …",
  gifts: [ /* 3 gifts */ ],
  reasons: [ /* fun facts */ ],
};
```

---

## 🚀 Host it on GitHub (GitHub Pages)

### 1. Build the single-file version

```bash
npm install
npm run build
```

The build produces **`dist/index.html`** — a completely self-contained file
(HTML + CSS + JS inlined, no external dependencies except Google Fonts).

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Birthday surprise card 🎉"
git branch -M main
git remote add origin https://github.com/<your-username>/birthday-card.git
git push -u origin main
```

### 3. Turn on GitHub Pages

1. Open the repository on GitHub
2. **Settings → Pages**
3. Under *Source*, pick **Deploy from a branch**
4. Branch: `main` → folder: **`/ (root)`** → **Save**

> GitHub Pages looks for `index.html` at the project root. Because the build output
> is `dist/index.html`, either:
> - **Option A (easiest):** upload just the `dist/index.html` file into its own repo
>   and rename the folder contents so that `index.html` is at the root, or
> - **Option B:** add a GitHub Action that publishes the `dist` folder.

### Option B — auto-deploy workflow (recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy card to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in **Settings → Pages → Source**, choose **GitHub Actions**.

Your card will be live at:
`https://<your-username>.github.io/<repo-name>/` 🎈

---

## 💡 Tip

Music only starts when the visitor taps the "Play song" button — browsers require a
click before playing audio. Open the card **for** your brother and press play for him!
