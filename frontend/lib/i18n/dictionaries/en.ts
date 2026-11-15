/** English copy. `ka.ts` must mirror this shape exactly (it is typed against it). */
export const en = {
  meta: {
    title: "Myst Tattoo Studio — Tattoos & Piercings in Tbilisi",
    description:
      "Myst Tattoo Studio — a creative space in Tbilisi for self-expression, unique ideas and high-quality body art. Tattoos, piercings and gift vouchers.",
    ogDescription: "A creative space for self-expression, unique ideas and high-quality body art.",
    keywords: ["tattoo", "piercing", "Tbilisi", "tattoo studio", "Myst"],
  },
  common: {
    homeAria: "Myst Tattoo Studio — home",
    bookNow: "Book Now",
    bookAppointment: "Book an Appointment",
    ourArtists: "Our Artists",
  },
  nav: {
    mainAria: "Main",
    mobileAria: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Home",
    artists: "Artists",
    tattoos: "Tattoos",
    piercing: "Piercing",
    whyMyst: "Why Myst",
  },
  langSwitcher: {
    aria: "Language",
  },
  hero: {
    eyebrow: "Tattoo / Piercing / Art",
    titleLine1: "Tattoos &",
    titleLine2: "Piercings",
    subtitle: "In Tbilisi",
    tagline:
      "Myst Tattoo Studio — a creative space for self-expression, unique ideas and high-quality body art.",
    lilyAlt: "Purple lily with a golden ring and a four-point star",
  },
  quickLinks: {
    aria: "Explore",
    tattoos: "Tattoos",
    piercing: "Piercing",
    artists: "Our Artists",
    whyMyst: "Why Myst",
  },
  vouchers: {
    titleLine1: "Gift",
    titleLine2: "Vouchers",
    text: "A meaningful gift for someone special.",
    cta: "Get a Voucher",
  },
  idea: {
    title: "Tell us your idea",
    lead: "Fill in the form and a ready-made WhatsApp message opens. We'll reply to agree the details.",
    steps: [
      { title: "Send your idea", text: "A few words is enough: design, placement, size." },
      { title: "Talk it through", text: "The artist replies to go over the details and the price." },
      { title: "Meet at the studio", text: "We agree on a day and time." },
    ],
    directTitle: "Prefer to message us directly?",
    whatsapp: "WhatsApp",
    instagramDm: "Instagram DM",
  },
  form: {
    aria: "Booking request",
    name: "Your name",
    service: "Service",
    services: ["Tattoo", "Piercing", "Gift voucher", "Cover-up", "Consultation"],
    idea: "Idea",
    optional: "(optional)",
    ideaPlaceholder: "e.g. moon and stars, fine line, wrist, ~5 cm",
    day: "Preferred day",
    today: "Today",
    tomorrow: "Tomorrow",
    time: "Time of day",
    times: ["Morning", "Afternoon", "Evening"],
    submit: "Send on WhatsApp",
    /** Lines of the pre-filled WhatsApp message; {placeholders} are filled in. */
    message: {
      greeting: "Hi Myst! I'd like to book: {service}.",
      name: "Name: {name}",
      idea: "Idea: {idea}",
      day: "Preferred day: {day}",
      time: "Time of day: {time}",
    },
  },
  footer: {
    city: "Tbilisi, Georgia",
    follow: "Follow us",
    bookLine1: "Book an Appointment",
    bookLine2: "Online",
  },
  notFound: {
    title: "Page not found",
    text: "This part of the site is still being inked. Head back home or send us your idea.",
    home: "Back home",
    idea: "Tell us your idea",
  },
};

export type Dictionary = typeof en;
