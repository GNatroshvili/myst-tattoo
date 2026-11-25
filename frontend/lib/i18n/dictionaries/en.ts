/** English copy. `ka.ts` must mirror this shape exactly (it is typed against it). */
export const en = {
  meta: {
    title: "Myst Tattoo Studio - Tattoos & Piercings in Tbilisi",
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
    about: "About",
    artists: "Artists",
    tattoos: "Tattoos",
    piercing: "Piercing",
    course: "Course",
    blog: "Blog",
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
  },
  quickLinks: {
    aria: "Explore",
    tattoos: "Tattoos",
    piercing: "Piercing",
    artists: "Our Artists",
    info: "Info & Care",
  },
  /** A few pieces on the home page; each opens the full gallery. */
  featured: {
    eyebrow: "Myst / Selected work",
    title: "Featured projects",
    viewAll: "View all tattoos",
    openGallery: "Open tattoo gallery",
    previous: "Previous projects",
    next: "Next projects",
  },
  vouchers: {
    titleLine1: "Gift",
    titleLine2: "Vouchers",
    text: "A meaningful gift for someone special.",
    cta: "Get a Voucher",
  },
  /** The studio on Google Maps: a map, its rating and reviews (home page). */
  reviews: {
    eyebrow: "Myst / On Google Maps",
    title: "Reviews & Location",
    allReviews: "All reviews",
    ratingLabel: "Guest rating",
    /** read out for a row of stars; {rating} is "5" or "4.8" */
    stars: "Rated {rating} out of 5",
    countOne: "1 review",
    countMany: "{count} reviews",
    directions: "Get directions",
    writeReview: "Write a review",
    mapAria: "Map: where the studio is",
    openMap: "Open in Google Maps",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    readOnGoogle: "Read on Google Maps",
    translated: "Translated by Google",
    previous: "Previous reviews",
    next: "Next reviews",
    /** under the reviews; "Google Maps" follows it */
    sourceNote: "The most relevant reviews, as chosen by",
  },
  /** Frequently asked questions (home page). The questions and answers come from the admin panel. */
  /** The row of figures on the home page; the figures and their lines come from the admin panel. */
  stats: {
    aria: "The studio in numbers",
  },
  faq: {
    eyebrow: "Myst / FAQ",
    title: "Frequently asked questions",
    lead: "Short answers to what we're asked most often. Something else on your mind? Write to us.",
    ask: "Ask on WhatsApp",
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
    services: ["Tattoo Consultation", "Piercing", "Gift Card"],
    idea: "Idea",
    optional: "(optional)",
    ideaPlaceholder: "e.g. moon and stars, fine line, wrist, ~5 cm",
    day: "Preferred days",
    /** beside the label: how many days may be picked */
    dayLimit: "(up to 3)",
    /** read out for a picked day's chip; pressing it un-picks the day */
    removeDay: "Remove {day}",
    today: "Today",
    tomorrow: "Tomorrow",
    /** the button that opens the calendar, for a date past the row of days */
    otherDate: "Later date",
    calendar: {
      title: "Choose a date",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      /** the button that closes the calendar */
      done: "Done",
    },
    time: "Time of day",
    times: ["Morning", "Afternoon", "Evening"],
    submit: "Send on WhatsApp",
    /** Lines of the pre-filled WhatsApp message; {placeholders} are filled in. */
    message: {
      greeting: "Hi Myst! I'd like to book: {service}.",
      name: "Name: {name}",
      idea: "Idea: {idea}",
      day: "Preferred day: {day}",
      /** when more than one day is picked; {days} are separated by "; " */
      days: "Preferred days: {days}",
      time: "Time of day: {time}",
    },
  },
  artists: {
    metaTitle: "Our Artists",
    metaDescription:
      "Meet the tattoo artists of Myst Tattoo Studio in Tbilisi. Each has their own hand and their own style — find the one whose work speaks to you.",
    eyebrow: "Myst / Artists",
    title: "Our Artists",
    subtitle: "In Tbilisi",
    lead: "Meet the people behind the work. Each artist has their own hand and their own style — find the one whose work speaks to you.",
    gridAria: "Artists",
    photoAria: "Artist photo placeholder",
    photoLabel: "Artist photo",
    openProfile: "Open artist profile",
    /** Shown while no artists have been added in the admin panel. */
    emptyTitle: "Artists coming soon",
    emptyText: "We're putting the team's profiles together. Check back shortly.",
    viewProfile: "View profile",
    book: "Book",
    /** Beside the styles on the card of an artist who does piercings. */
    piercingTag: "Piercing",
    ctaTitleLine1: "Not sure",
    ctaTitleLine2: "who to choose?",
    ctaText: "Tell us your idea and we'll suggest the artist whose style fits it best.",
    cta: "Contact Us",
  },
  /** One artist's profile page. The title and description are the fallbacks. */
  artist: {
    metaTitle: "Artist profile",
    metaDescription:
      "A tattoo artist at Myst Tattoo Studio in Tbilisi: their style, their story and everything they have tattooed at the studio.",
    back: "All artists",
    eyebrow: "Myst / Artist",
    book: "Book with this artist",
    seeWorks: "See works",
    worksTitle: "Works",
    worksLead: "Everything this artist has tattooed at Myst.",
    filterAria: "Filter by style",
    allWorks: "All works",
    countOne: "Showing 1 work",
    countMany: "Showing {count} works",
    noWorks: "No works have been added yet.",
    piercingsTitle: "Piercings",
    piercingsLead: "Piercings this artist has done at Myst.",
    ctaTitleLine1: "Want a piece",
    ctaTitleLine2: "by this artist?",
    ctaText: "Send us your idea and we'll agree the design, placement and size.",
    allTattoos: "All Tattoos",
  },
  tattoos: {
    metaTitle: "Tattoos",
    metaDescription:
      "Tattoos drawn and tattooed at Myst Tattoo Studio in Tbilisi by our own artists. Browse the portfolio by artist or style.",
    eyebrow: "Myst / Portfolio",
    title: "Tattoos",
    subtitle: "By Myst Artists",
    lead: "Every piece here was drawn and tattooed at Myst by our own artists. Filter by artist or style to find what speaks to you.",
    filtersAria: "Filters",
    artistLabel: "Artist",
    styleLabel: "Style",
    allArtists: "All artists",
    allStyles: "All styles",
    countOne: "Showing 1 tattoo",
    countMany: "Showing {count} tattoos",
    galleryAria: "Tattoo gallery",
    /** What a photo shows, for screen readers; {style} and {artist} are filled in. */
    photoAlt: "{style} tattoo",
    photoAltBy: "{style} tattoo by {artist}",
    /** Shown while no tattoos have been added in the admin panel. */
    noneTitle: "Tattoos coming soon",
    noneText: "We're adding our work to the gallery. Check back shortly.",
    /** Shown when the picked artist and style have no tattoo in common. */
    emptyTitle: "Nothing here yet",
    emptyText: "No work matches this artist and style together. Try another combination.",
    showAll: "Show all tattoos",
    /** The details window that opens when a tattoo is picked. */
    modal: {
      open: "Open tattoo details",
      aria: "Tattoo details",
      eyebrow: "Myst / Tattoo",
      tattooedBy: "Tattooed by",
      viewProfile: "View profile",
      bookSimilar: "Book a similar tattoo",
      previous: "Previous",
      next: "Next",
      close: "Close",
    },
    ctaTitleLine1: "See something",
    ctaTitleLine2: "you love?",
    ctaText: "Send us your idea and we'll agree the design, placement and size.",
  },
  piercing: {
    metaTitle: "Piercing",
    metaDescription:
      "Piercing at Myst Tattoo Studio in Tbilisi: zones, prices with standard titanium jewelry, and piercings done at the studio.",
    eyebrow: "Myst / Piercing",
    title: "Piercing",
    subtitle: "In Tbilisi",
    pricesAria: "Zones and prices",
    zonesAria: "Piercing zones",
    priceNote: "Prices include standard titanium jewelry.",
    /** Shown for a zone that has no places yet. */
    noPlaces: "Prices for this zone are coming soon.",
    /** Shown while no zones have been added in the admin panel. */
    pricesEmptyTitle: "Prices coming soon",
    pricesEmptyText: "We're putting the price list together. Write to us and we'll tell you the price.",
    worksTitle: "Our work",
    worksLead: "Piercings done at the studio by our artists. Filter by zone.",
    filterAria: "Filter by zone",
    all: "All",
    countOne: "Showing 1 piercing",
    countMany: "Showing {count} piercings",
    /** What a photo shows, for screen readers; {place} and {artist} are filled in. */
    photoAlt: "{place} piercing",
    photoAltBy: "{place} piercing by {artist}",
    /** Shown while no piercing photos have been added in the admin panel. */
    worksEmptyTitle: "Piercings coming soon",
    worksEmptyText: "We're adding our work to the gallery. Check back shortly.",
    ctaTitleLine1: "Ready for a",
    ctaTitleLine2: "new piercing?",
    ctaText: "Tell us the placement you want and we'll agree a day and time.",
  },
  blog: {
    metaTitle: "Blog",
    metaDescription:
      "Aftercare guides, studio news and the stories behind the work at Myst Tattoo Studio in Tbilisi.",
    eyebrow: "Myst / Blog",
    title: "Blog",
    subtitle: "Stories & Care",
    lead: "Aftercare guides, studio news and the stories behind the work.",
    filterAria: "Filter by topic",
    all: "All",
    /** over the newest article, shown large above the rest */
    latest: "Latest",
    /** {minutes} is a whole number */
    readTime: "{minutes} min read",
    readArticle: "Read article",
    read: "Read",
    openArticle: "Open article",
    countOne: "Showing 1 article",
    countMany: "Showing {count} articles",
    articlesAria: "Articles",
    emptyTitle: "Articles coming soon",
    emptyText: "We're writing the first ones. Check back shortly.",
    /** One article's own page. */
    article: {
      back: "All articles",
    },
    ctaTitleLine1: "Have a",
    ctaTitleLine2: "question?",
    ctaText: "Didn't find the answer here? Write to us and we'll help.",
    cta: "Contact Us",
  },
  /** The tattoo course's page. Its title, text and photos come from the admin panel. */
  course: {
    metaTitle: "Tattoo Course",
    metaDescription:
      "Learn tattooing at Myst Tattoo Studio in Tbilisi: what the course covers, how it runs and how to sign up.",
    eyebrow: "Myst / Course",
    /** before the date the course was posted: "Posted: 23 November 2026" */
    published: "Posted",
    about: "About the course",
    photosAria: "Course photos",
    /** read out for a photo; {number} counts from 1 */
    photoAria: "Course photo {number}",
    emptyTitle: "Course coming soon",
    emptyText: "We're preparing the next tattoo course. Write to us and we'll tell you when sign-up opens.",
    emptyCta: "Contact Us",
    /** The sign-up card: a short form that opens a ready-made WhatsApp message. */
    signup: {
      aria: "Course sign-up",
      label: "Sign-up & questions",
      titleLine1: "Join the",
      titleLine2: "course",
      text: "Fill in the form and a ready-made WhatsApp message opens. We'll reply and agree the details.",
      name: "Your name",
      note: "Question",
      optional: "(optional)",
      notePlaceholder: "e.g. when does the next group start?",
      submit: "Send on WhatsApp",
      instagramDm: "Instagram DM",
      /** Lines of the pre-filled WhatsApp message; {placeholders} are filled in. */
      message: {
        greeting: "Hi Myst! I'd like to join the tattoo course: {course}.",
        name: "Name: {name}",
        note: "Question: {note}",
      },
    },
  },
  /** The "About us" page. Its sections (photo, title, text) come from the admin panel. */
  about: {
    metaTitle: "About Us",
    metaDescription:
      "Myst Tattoo Studio in Tbilisi: who we are, how we work and what to expect when you come in for a tattoo or a piercing.",
    eyebrow: "Myst / About",
    title: "About Us",
    subtitle: "Our Story",
    lead: "Myst Tattoo Studio — a creative space for self-expression, unique ideas and high-quality body art.",
    sectionsAria: "About the studio",
    /** read out for a section's photo; {number} counts from 1 */
    photoAria: "Studio photo {number}",
    /** Shown while no sections have been added in the admin panel. */
    emptyTitle: "Our story is coming soon",
    emptyText: "We're putting this page together. Check back shortly.",
  },
  /** The privacy policy's page. Its text comes from the admin panel, or is the standard one in lib/privacy.ts. */
  privacy: {
    metaTitle: "Privacy Policy",
    metaDescription:
      "How the website of Myst Tattoo Studio in Tbilisi treats your data: the Google map, the reviews from Google Maps and the booking form.",
    eyebrow: "Myst / Privacy",
    title: "Privacy Policy",
    /** before the date the text was last saved: "Last updated: 24 November 2026" */
    updated: "Last updated",
    /** over the list of the text's sections */
    contents: "On this page",
    contactTitle: "A question about your data?",
    whatsapp: "WhatsApp",
    instagramDm: "Instagram DM",
  },
  footer: {
    city: "Tbilisi, Georgia",
    follow: "Follow us",
    question: "Have a question?",
    contact: "Contact us",
    privacy: "Privacy Policy",
  },
  notFound: {
    title: "Page not found",
    text: "This part of the site is still being inked. Head back home or send us your idea.",
    home: "Back home",
    idea: "Tell us your idea",
  },
};

export type Dictionary = typeof en;
