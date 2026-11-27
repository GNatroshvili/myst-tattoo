# Myst Tattoo - Frontend

Next.js (App Router, TypeScript, Tailwind CSS v4) landing page for Myst Tattoo Studio.

## Setup

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_WHATSAPP_NUMBER
npm install
npm run dev                  # http://localhost:3000
```

## Structure

```
app/
  layout.tsx          # fonts (Cormorant Garamond + Inter), metadata
  page.tsx            # home page composition
  not-found.tsx       # styled 404
  [lang]/book/        # the booking form on a page of its own: where "Book" leads from every page but home (not in the menu, sitemap or search)
  [lang]/about/       # "About us": sections (photo, optional title, text) from the admin panel
  [lang]/course/      # the tattoo course: title, date, photos and text from the admin panel
  [lang]/privacy/     # the privacy policy: the admin panel's text, or the standard one in lib/privacy.ts
  sitemap.ts          # /sitemap.xml: every public page in both languages, with its photos
  robots.ts           # /robots.txt: what crawlers may open, and where the sitemap is
  globals.css         # design tokens (@theme) + component classes
components/
  Header.tsx          # nav + mobile menu (client)
  Hero.tsx            # headline + CTA over the studio film, which fills the section
  HeroVideo.tsx       # the film itself (public/videos): a still at first, the film once the page is up (client)
  QuickLinks.tsx      # Tattoos / Piercing / Our Artists / Why Myst
  StudioStats.tsx     # the row of figures ("700+ reviews on Google") from the admin panel; left out while there are none (server)
  StatNumber.tsx      # one figure, counting up when scrolled to (client)
  useCountUp.ts       # the counting itself, shared with the review count
  GiftVouchers.tsx    # voucher banner
  StudioReviews.tsx   # Google rating, reviews and the map's frame (server)
  StudioMap.tsx       # the Google map itself, loaded when scrolled to (client)
  Faq.tsx             # frequently asked questions from the admin panel; left out while there are none (server)
  FaqList.tsx         # the questions, each opening its answer (client)
  IdeaSection.tsx     # "Tell us your idea" layout (server)
  IdeaForm.tsx        # booking form -> WhatsApp deep link (client)
  CourseSignup.tsx    # the /course page's sign-up card -> WhatsApp deep link (client)
  Footer.tsx
  motion/MotionProvider.tsx  # around every public page: loads the animation code after the page is up (client)
  motion/Reveal.tsx   # a part that fades in and rises the first time it is scrolled to (client)
  motion/features.ts  # what the motion library needs, kept in a file of its own so it loads late
  ui/Icons.tsx
lib/
  site.ts             # studio details, nav, services
  site-url.ts         # the site's public address (SITE_URL), for the sitemap and robots.txt
  google-place.ts     # the studio on Google Maps: rating, reviews, coordinates (Places API)
  privacy.ts          # the privacy policy's standard text, and how its text becomes headings and paragraphs
  dates.ts            # upcoming days in the studio's time zone
  cascade.ts          # the wait that makes a row of revealing parts arrive one after another
  whatsapp.ts         # message + wa.me URL builders
```

Nav targets `/artists`, `/tattoos`, `/piercing`, `/why-myst` are not built yet and
show the styled 404 page.

## The hero film

`public/videos` holds the cuts of one 4K recording that `HeroVideo.tsx` plays. The wide cut is the
recording's picture without its black left band (`crop=2764:1728:1076:216`), in three files:

| File | Picture | Codec | Size | For |
| --- | --- | --- | --- | --- |
| `hero-desktop.mp4` | 1920×1200 | H.264 | 15 MB | every browser |
| `hero-desktop-av1.mp4` | 1920×1200 | AV1, 10-bit | 11 MB | browsers that play AV1 well |
| `hero-desktop-hd-av1.mp4` | 2764×1728 | AV1, 10-bit | 19 MB | the same, on screens wider than 1920 device pixels |

To cut them again from the recording (`-an` drops the sound; add `scale=1920:1200:flags=lanczos`
after the crop for the two smaller files):

```bash
ffmpeg -i recording.mp4 -an -vf "crop=2764:1728:1076:216,scale=1920:1200:flags=lanczos" \
  -c:v libx264 -preset veryslow -refs 5 -level 5.0 -crf 21 -pix_fmt yuv420p -x264-params aq-mode=3 \
  -movflags +faststart hero-desktop.mp4
ffmpeg -i recording.mp4 -an -vf "crop=2764:1728:1076:216,scale=1920:1200:flags=lanczos" \
  -c:v libsvtav1 -preset 3 -crf 30 -g 240 -pix_fmt yuv420p10le \
  -svtav1-params tune=0:enable-variance-boost=1 -movflags +faststart hero-desktop-av1.mp4
ffmpeg -i recording.mp4 -an -vf "crop=2764:1728:1076:216" \
  -c:v libsvtav1 -preset 3 -crf 33 -g 240 -pix_fmt yuv420p10le \
  -svtav1-params tune=0:enable-variance-boost=1 -movflags +faststart hero-desktop-hd-av1.mp4
```

`hero-desktop.jpg` is the first frame of the same crop at 1920×1200, shown until the film starts.
