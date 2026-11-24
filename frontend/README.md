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
  [lang]/course/      # the tattoo course: title, date, photos and text from the admin panel
  globals.css         # design tokens (@theme) + component classes
components/
  Header.tsx          # nav + mobile menu (client)
  Hero.tsx            # headline + CTA + HeroLily
  HeroLily.tsx        # lily artwork (public/images/hero-lily.webp) via next/image
  QuickLinks.tsx      # Tattoos / Piercing / Our Artists / Why Myst
  GiftVouchers.tsx    # voucher banner
  StudioReviews.tsx   # Google rating, reviews and the map's frame (server)
  StudioMap.tsx       # the Google map itself, loaded when scrolled to (client)
  Faq.tsx             # frequently asked questions from the admin panel; left out while there are none (server)
  FaqList.tsx         # the questions, each opening its answer (client)
  IdeaSection.tsx     # "Tell us your idea" layout (server)
  IdeaForm.tsx        # booking form -> WhatsApp deep link (client)
  CourseSignup.tsx    # the /course page's sign-up card -> WhatsApp deep link (client)
  Footer.tsx
  ui/Icons.tsx
lib/
  site.ts             # studio details, nav, services
  google-place.ts     # the studio on Google Maps: rating, reviews, coordinates (Places API)
  dates.ts            # upcoming days in the studio's time zone
  whatsapp.ts         # message + wa.me URL builders
```

Nav targets `/artists`, `/tattoos`, `/piercing`, `/why-myst` are not built yet and
show the styled 404 page.
