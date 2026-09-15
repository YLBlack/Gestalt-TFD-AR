# غيستالت: اليوم الخامس — الموقع العربي (GESTALT: The Fifth Day — Arabic Fan Site)

موقع تعريفي عربي غير رسمي للعبة الرعب النفسي **GESTALT: The Fifth Day** من تطوير **KinjaKo** (متوفرة على Steam). الموقع مبني بعد قراءة ملفات اللعبة نفسها — نصوصها، خطوطها، صورها، أصواتها — ليعكس أجواءها وأسلوبها.

A self-contained static site (HTML + CSS + JS, no dependencies, no build step).

## التشغيل / Running locally

```bash
cd website
python -m http.server 8000
# ثم افتح http://localhost:8000
```

Any static server works. Opening `index.html` via `file://` works too, except the ambient audio may be blocked by browser autoplay policies — the ♪ button requires a click regardless.

## البنية / Structure

```
website/
├── index.html          # الصفحة الكاملة (عربي RTL)
├── secrets.html        # صفحة الأسرار — محاكاة شاشة بحث WICKE_PC(D:) من اللعبة
├── css/style.css       # الثيم الداكن + CRT flicker/scanlines + شاشة الحاسوب
├── js/main.js          # شاشة التحذير، الكتابة الآلية، البومة، زر التعريب، الموسيقى
├── assets/             # منسوخة من ملفات اللعبة
│   ├── fonts/Truetypewriter.ttf   # الأصل الكامل من جذر اللعبة (1.4MB) — عربي سليم 100%
│   ├── hero.png                   # gui/main_menu.png
│   ├── title.png                  # gui/title.png (شعار اللعبة)
│   ├── owl1.png / owl2.png        # images/owlanim1/2.png (إطار كل 0.7s)
│   ├── kinja.png                  # gui/kinja.png (أيقونة المطوّر)
│   └── favicon.png                # gui/window_icon.png
├── assets/translation.rpy  # (اختياري) ملف تعريب المترجم — يُوضع هنا ليتفعّل زر التنزيل تلقائيًا
└── audio/theme.mp3     # audio/"main theme.mp3" من اللعبة
```

### تفعيل زر «تنزيل التعريب» / Activating the translation download

بمجرد وضع ملف `translation.rpy` في `website/assets/`، يكشفه `js/main.js` عبر `fetch(HEAD)` ويزيل `hidden`/`aria-disabled` من زر التنزيل تلقائيًا — لا حاجة لتعديل أي كود. قبل ذلك يظهر الزر معطلًا (بشفافية 45%، بدون تأثير) مع نص «قيد العمل».

### بارامترات URL للاختبار

- `?nosplash` — تخطّي شاشة التحذير الافتتاحية.
- `?reveal=all` — إظهار كل صناديق النص والبطاقات فورًا دون انتظار التمرير.
- `?scroll=SECTION` — تمرير فوري إلى قسم (`story`, `days`, `characters`, `endings`, `triggers`, `localization`, `dev`).
- `?show=SECTION` — إزاحة المحتوى بدون تمرير (لبيئات لقطات الشاشة التي لا تعيد الرسم بعد scroll).

مثال: `index.html?nosplash&reveal=all&show=endings`. هذه البارامترات لا تغيّر سلوك الموقع الافتراضي إطلاقًا.

### تجربة صفحة الأسرار / Trying the secrets page

افتح `secrets.html` واكتب مثل `WICKE` أو `OWLS` أو `TELL ME A JOKE`. الرموز السرية الأربعة الحقيقية من اللعبة (`KINJAKO022920`، `KINJAKO101493`، `KINJAKO040524`، `KINJAKO254980`) تعمل وتُحصى «SECRETS FOUND: n/4». `EXIT` يعيدك للصفحة الرئيسية.

## الممارسات / Notes

- **Font provenance:** `Truetypewriter.ttf` ships with the game (project root) and is used **as-is**. A subsetting attempt (pyftsubset and HarfBuzz both) broke the font's Arabic contextual-form lookups — the source TTF's GSUB contains malformed ChainContext subtables that don't survive any subsetter. The original renders perfectly in browsers, so we ship the full 1.4MB file. If size ever matters, the safe route is regenerating a clean font from the designer's source, not subsetting this one.
- **Translation source:** site copy follows `translation.rpy` (the translator's own file) wherever it covers the same strings — intro monologue, splash warning, endings II/III/V names, the hintman monologue (feminine forms: «لقد كنتِ تحاولين…»، «لا تتوقفي أبدًا…»), achievement descriptions («أحصل على…»). The trigger list has no in-file translation, so it stays closest to the game's English list.
- **RTL:** `dir="rtl"` on `<html>`; all directional CSS uses logical properties (`inset-inline-*`, `margin-inline-*`).
- **Accessibility:** visible h1 (screen-reader-only), endings cards are plain articles (no spurious tab stops), `aria-live` status on the التعريب section, skip link, `aria-pressed` on the audio button, visible focus styles, `prefers-reduced-motion` disables flicker/typewriter/owl. Contrast: all text ≥ 4.5:1 (footer note raised 3.94 → 7.46:1).
- **No tracking, no external requests:** everything is local. Deploy the `website/` folder as-is to any static host.
- **Fan-site disclaimer:** in the footer and credits section. Game © KinjaKo; التعريب by B_L_M3 (x.com/B_L_M3).

## التحقق / Validation performed

- Served with `python -m http.server` and verified in the app preview at desktop/tablet/mobile widths.
- Console and network: clean (no 404s, no JS errors).
- Arabic shaping verified visually (connected letterforms in Truetypewriter).
- Interactions tested: splash → enter, audio toggle, scroll reveals, hover/focus states, owl flyby (desktop only).
