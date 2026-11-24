import type { Localized } from "./types";

/**
 * The privacy policy: the standard text the site carries, and how a policy's
 * text becomes headings and paragraphs.
 *
 * The /privacy page shows the text saved in the admin panel's "პოლიტიკა" tab
 * (see `getPrivacy` in api.ts). Until one is saved there, and whenever the
 * saved one is deleted, it shows the standard text below; the panel's form
 * opens filled in with it.
 *
 * How the text is written: an empty line starts a new paragraph, and a line
 * that begins with "#" is a section's heading. Addresses that begin with
 * http:// or https:// become links.
 */

/** What the standard text says is what the site does: change one with the other. */
export const standardPolicy: Localized = {
  en: `This page explains what happens to your data when you visit the website of Myst Tattoo Studio. In short: the site has no accounts, sets no cookies for visitors and uses no advertising or analytics tools. Two parts of the home page, the map and the reviews, come from Google, and they are described below.

# The map (Google Maps)

The home page shows a map with the studio's location. The map is provided by Google Maps and is loaded only when you scroll close to it. From that moment your browser connects directly to Google's servers, and Google receives technical data such as your IP address, the type of your browser and device, and the language of the page. Google may also keep data in your browser to make the map work. We do not receive or keep any of this.

Google handles this data under its own rules: see the Google Privacy Policy (https://policies.google.com/privacy) and the Google Maps terms of use (https://maps.google.com/help/terms_maps/). The buttons "Get directions" and "Open in Google Maps" take you to Google Maps itself.

# Reviews from Google Maps

Beside and under the map we show the studio's rating and some of the reviews that guests have published on Google Maps. A review appears as its author published it: the name, the profile picture, the stars, the text and roughly when it was written, with a link to the same review on Google Maps. Google chooses which reviews are shown; we do not change them.

Our server asks Google for the reviews a few times a day and keeps them only briefly, so that the page opens quickly. The authors' profile pictures are loaded by your browser straight from Google's servers.

If a review is yours and you want to change or delete it, you can do so in your Google account; the change shows on this site within a day. You can also write to us and we will help.

# Booking and messages

The booking form and the course sign-up form send nothing to our website. What you fill in (your name, the service, your idea, the days you prefer) is put into a ready-made WhatsApp message, which you send yourself from your own WhatsApp. From there on the conversation takes place in WhatsApp, or in Instagram if you write to us there, and those services' own privacy policies apply. We use what you write only to answer you and to arrange your visit.

# Hosting

Like every website, ours is delivered to you by a hosting provider. It keeps technical records for a short time (IP address, time, the page requested) so that the site works and stays secure.

# Your rights and contact

You can ask us what data of yours we hold, and ask us to correct or delete it. Write to us on WhatsApp or Instagram: the buttons are under this text.

# Changes

If this policy changes, the new text is published on this page.`,

  ka: `ამ გვერდზე წერია, რა ხდება შენს მონაცემებთან, როცა Myst Tattoo Studio-ს ვებსაიტს სტუმრობ. მოკლედ: საიტზე რეგისტრაცია არ არის, სტუმრებისთვის ქუქი-ფაილებს (cookies) არ ვიყენებთ და არც სარეკლამო ან ანალიტიკის ხელსაწყოები გვაქვს. მთავარი გვერდის ორი ნაწილი, რუკა და შეფასებები, Google-ისგან მოდის. მათ შესახებ ქვემოთ წერია.

# რუკა (Google Maps)

მთავარ გვერდზე ჩანს რუკა, რომელზეც სტუდიის მდებარეობაა მონიშნული. რუკას Google Maps გვაწვდის და ის მხოლოდ მაშინ იტვირთება, როცა გვერდს მის სიახლოვეს ჩამოსქროლავ. ამ დროიდან შენი ბრაუზერი პირდაპირ Google-ის სერვერებს უკავშირდება და Google იღებს ტექნიკურ მონაცემებს: IP მისამართს, ბრაუზერისა და მოწყობილობის ტიპს, გვერდის ენას. რუკის სამუშაოდ Google-მა შეიძლება შენს ბრაუზერში მონაცემებიც შეინახოს. ჩვენ ამ მონაცემებს არ ვიღებთ და არ ვინახავთ.

ამ მონაცემებს Google თავისი წესებით ამუშავებს: იხილე Google-ის კონფიდენციალურობის პოლიტიკა (https://policies.google.com/privacy) და Google Maps-ის გამოყენების პირობები (https://maps.google.com/help/terms_maps/). ღილაკებს „მარშრუტის ნახვა“ და „გახსენი Google Maps-ში“ პირდაპირ Google Maps-ზე გადაჰყავხარ.

# შეფასებები Google Maps-იდან

რუკის გვერდით და მის ქვემოთ ვაჩვენებთ სტუდიის რეიტინგს და იმ შეფასებების ნაწილს, რომლებიც სტუმრებმა Google Maps-ზე გამოაქვეყნეს. შეფასება ისე ჩანს, როგორც ავტორმა გამოაქვეყნა: სახელი, პროფილის ფოტო, ვარსკვლავები, ტექსტი და დაახლოებით როდის დაიწერა, Google Maps-ზე იმავე შეფასების ბმულით. რომელი შეფასებები გამოჩნდეს, Google ირჩევს; ჩვენ მათ არ ვცვლით.

შეფასებებს ჩვენი სერვერი Google-ისგან დღეში რამდენჯერმე იღებს და მხოლოდ მცირე ხნით ინახავს, რომ გვერდი სწრაფად გაიხსნას. ავტორების პროფილის ფოტოებს შენი ბრაუზერი პირდაპირ Google-ის სერვერებიდან ტვირთავს.

თუ შეფასება შენია და მისი შეცვლა ან წაშლა გინდა, ეს შენი Google ანგარიშიდან კეთდება; ცვლილება ამ საიტზე ერთ დღეში აისახება. შეგიძლია ჩვენც მოგვწერო და დაგეხმარებით.

# ჯავშანი და შეტყობინებები

ჯავშნის და კურსზე ჩაწერის ფორმები ჩვენს საიტს არაფერს უგზავნის. რასაც შეავსებ (სახელი, სერვისი, იდეა, სასურველი დღეები), მზა WhatsApp შეტყობინებაში ჩაიწერება, რომელსაც შენივე WhatsApp-იდან თავად აგზავნი. ამის შემდეგ მიმოწერა WhatsApp-ში გრძელდება, ან Instagram-ში, თუ იქ მოგვწერ, და მასზე ამ სერვისების საკუთარი კონფიდენციალურობის პოლიტიკა ვრცელდება. რასაც მოგვწერ, მხოლოდ იმისთვის ვიყენებთ, რომ გიპასუხოთ და ვიზიტი შევათანხმოთ.

# ჰოსტინგი

როგორც ყველა ვებსაიტს, ჩვენსასაც ჰოსტინგის პროვაიდერი აწვდის სტუმარს. ის მცირე ხნით ინახავს ტექნიკურ ჩანაწერებს (IP მისამართი, დრო, მოთხოვნილი გვერდი), რომ საიტმა იმუშაოს და დაცული იყოს.

# შენი უფლებები და კონტაქტი

შეგიძლია გვკითხო, შენი რა მონაცემები გვაქვს, და მოითხოვო მათი გასწორება ან წაშლა. მოგვწერე WhatsApp-ზე ან Instagram-ზე: ღილაკები ამ ტექსტის ქვემოთაა.

# ცვლილებები

თუ ეს პოლიტიკა შეიცვლება, ახალი ტექსტი ამავე გვერდზე გამოქვეყნდება.`,
};

/** A piece of the policy's text: a section's heading, or a paragraph. */
export type PolicyBlock =
  | { kind: "heading"; text: string; /** what a link to the section ends in: "#section-2" */ id: string }
  | { kind: "text"; text: string };

/**
 * The text as headings and paragraphs, in order. A line that begins with "#"
 * is a heading by itself, wherever it stands; the lines between headings and
 * empty lines make up a paragraph.
 */
export function policyBlocks(text: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  let lines: string[] = [];
  let headings = 0;

  const closeParagraph = () => {
    if (lines.length > 0) blocks.push({ kind: "text", text: lines.join("\n") });
    lines = [];
  };

  for (const raw of text.split(/\r\n?|\n/)) {
    const line = raw.trim();
    const heading = /^#+\s*(.*)$/.exec(line);
    if (heading) {
      closeParagraph();
      // a "#" with nothing after it is no heading: it is left out
      if (heading[1]) blocks.push({ kind: "heading", text: heading[1], id: `section-${++headings}` });
    } else if (line === "") {
      closeParagraph();
    } else {
      lines.push(line);
    }
  }
  closeParagraph();
  return blocks;
}

/** A stretch of a paragraph: plain words, or an address to link. */
export type PolicyPart = { text: string; href?: string };

/**
 * A paragraph with its web addresses set apart. The full stop, comma or
 * bracket that closes the sentence after an address is not part of it.
 */
export function policyParts(text: string): PolicyPart[] {
  const parts: PolicyPart[] = [];
  let from = 0;
  for (const match of text.matchAll(/https?:\/\/[^\s<>"„“”«»]+/g)) {
    const href = match[0].replace(/[.,;:!?)\]]+$/, "");
    const at = match.index;
    if (at > from) parts.push({ text: text.slice(from, at) });
    // shown without the "https://" every address begins with
    parts.push({ text: href.replace(/^https?:\/\//, "").replace(/\/$/, ""), href });
    from = at + href.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from) });
  return parts;
}
