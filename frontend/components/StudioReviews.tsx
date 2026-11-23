import { useId } from "react";
import { getPlace, type PlaceReview } from "@/lib/google-place";
import { displayCase, localeTags, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { FeaturedSlider } from "./FeaturedSlider";
import { ReviewCount } from "./ReviewCount";
import { StarRule } from "./StarRule";
import { StudioMap } from "./StudioMap";
import { ArrowRightIcon, ArrowUpRightIcon, MapPinIcon, RatingStarIcon } from "./ui/Icons";

type Copy = Dictionary["reviews"];

/** One review to a screen on phones (a sliver of the next hints at more), two on tablets, three on wide screens. */
const slide = "flex min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]";

/**
 * Five stars with `rating` of them gold; a part of a star is filled for an
 * average such as 4.7. Read out as one sentence.
 */
function Stars({ rating, label, className = "h-4 w-4" }: { rating: number; label: string; className?: string }) {
  const row = (tone: string) => (
    <span className={`flex gap-0.5 ${tone}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <RatingStarIcon key={i} className={`${className} shrink-0`} />
      ))}
    </span>
  );
  return (
    <span role="img" aria-label={label} className="relative inline-block align-middle">
      {row("text-cream/22")}
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${(Math.min(5, Math.max(0, rating)) / 5) * 100}%` }}
      >
        {row("text-gold")}
      </span>
    </span>
  );
}

/** "Google Maps" as Google asks for it to be written: spelled out, and never translated. */
function GoogleMaps({ className = "" }: { className?: string }) {
  return (
    <span translate="no" className={`font-normal ${className}`}>
      Google Maps
    </span>
  );
}

function Review({ review, t }: { review: PlaceReview; t: Copy }) {
  const { author } = review;
  const name = <span className="block truncate text-[16px] font-medium leading-[22px] text-cream">{author.name}</span>;

  return (
    <article className="flex min-w-0 flex-1 flex-col rounded-[14px] border border-cream/14 bg-surface p-5 sm:p-6">
      <header className="flex items-center gap-3.5">
        {author.photo ? (
          // a small picture from Google's own servers: nothing for the image optimiser to do
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.photo}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            // Google does not serve these pictures to a page that names itself
            referrerPolicy="no-referrer"
            draggable={false}
            className="h-11 w-11 shrink-0 rounded-full bg-raised object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-raised text-[18px] text-cream"
          >
            {author.name.charAt(0).toLocaleUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          {author.url ? (
            <a href={author.url} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-80">
              {name}
            </a>
          ) : (
            name
          )}
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] leading-[18px] text-muted">
            <Stars rating={review.rating} label={t.stars.replace("{rating}", String(review.rating))} className="h-3.5 w-3.5" />
            {review.when}
          </p>
        </div>
      </header>

      {/* a review may be in another language than the page: named for screen readers */}
      <p lang={review.lang} className="mt-4 line-clamp-6 whitespace-pre-line text-[15px] font-light leading-[23px] text-body">
        {review.text}
      </p>

      {/* pushed to the bottom, so the links of a row of cards line up */}
      <footer className="mt-auto flex flex-col items-start gap-1.5 pt-5 text-[13px] leading-[18px]">
        {review.translated && <span className="text-faint">{t.translated}</span>}
        {review.url && (
          <a href={review.url} target="_blank" rel="noopener noreferrer" className="link-arrow min-h-6 gap-1.5">
            {t.readOnGoogle} <ArrowUpRightIcon className="h-[11px] w-[11px]" />
          </a>
        )}
      </footer>
    </article>
  );
}

/**
 * Where the studio is and what its guests say: a Google map beside the
 * studio's rating on Google Maps, and under them the reviews Google picks to
 * show (five in each language it is asked in). Everything is read from Google (see lib/google-place);
 * the section is left out while that is not set up or cannot be reached.
 */
export async function StudioReviews({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const place = await getPlace(lang);
  if (!place) return null;
  return <Section lang={lang} t={dict.reviews} place={place} />;
}

function Section({ lang, t, place }: { lang: Locale; t: Copy; place: NonNullable<Awaited<ReturnType<typeof getPlace>>> }) {
  const titleId = useId();
  const { rating, ratingCount, reviews, links } = place;
  // "{count} reviews": the number is a part of its own, because it counts up
  const [beforeCount, afterCount = ""] = t.countMany.split("{count}");
  const rated = typeof rating === "number" && rating > 0;
  // always one decimal, the way Google Maps writes it: "5.0", "4.7"
  const average = rated ? rating.toFixed(1) : "";

  return (
    <section id="reviews" aria-labelledby={titleId} className="scroll-mt-6 pt-16 lg:pt-[84px]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:pl-5">
        <div>
          <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
          <h2
            id={titleId}
            className="display mt-5 text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-none tracking-[0.5px] text-cream"
          >
            {displayCase(t.title, lang)}
          </h2>
          <StarRule className="-ml-[5px] mt-5" star="h-[26px] w-[26px]" />
        </div>

        <a href={links.reviews} target="_blank" rel="noopener noreferrer" className="link-arrow min-h-11 gap-3 text-[17px]">
          {t.allReviews} <ArrowRightIcon className="h-3 w-[18px]" />
        </a>
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {place.location ? (
          <StudioMap
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || undefined}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || undefined}
            center={place.location}
            lang={lang}
            href={links.place}
            address={place.address}
            label={t.mapAria}
            openLabel={t.openMap}
            zoomInLabel={t.zoomIn}
            zoomOutLabel={t.zoomOut}
          />
        ) : null}

        {/* the rating, the address and the two things a visitor does next */}
        <div className="flex min-w-0 flex-col rounded-[14px] border border-cream/16 bg-[radial-gradient(90%_120%_at_85%_85%,rgba(125,46,85,0.72),rgba(125,46,85,0)_72%),linear-gradient(90deg,#120c0e,#170d12)] px-6 py-7 sm:px-8 sm:py-8">
          {rated && (
            <>
              <p className="caps label-caps">{displayCase(t.ratingLabel, lang)}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="display text-[64px] leading-none text-cream">{average}</span>
                <Stars rating={rating} label={t.stars.replace("{rating}", average)} className="h-[22px] w-[22px]" />
              </p>
              {/* the count stands out: it is the point of the line */}
              <p className="mt-2 text-[16px] font-light leading-9 text-body">
                {typeof ratingCount === "number" && (
                  <>
                    {ratingCount === 1 ? (
                      t.countOne
                    ) : (
                      <>
                        {beforeCount}
                        <ReviewCount
                          count={ratingCount}
                          locale={localeTags[lang].intl}
                          className="text-[30px] font-normal leading-none text-cream"
                        />
                        {afterCount}
                      </>
                    )}
                    {" · "}
                  </>
                )}
                <GoogleMaps className="text-cream" />
              </p>
            </>
          )}

          {place.address && (
            <p
              className={`flex items-start gap-3 text-[16px] font-light leading-6 text-cream ${
                rated ? "mt-6 border-t border-cream/14 pt-6" : ""
              }`}
            >
              <MapPinIcon className="mt-px h-6 w-6 shrink-0" />
              <span>
                <span className="block font-normal">{place.name}</span>
                {place.address}
              </span>
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-2.5 pt-7">
            <a href={links.directions} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
              {t.directions} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
            </a>
            {links.writeReview && (
              <a href={links.writeReview} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                {t.writeReview}
              </a>
            )}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <>
          <FeaturedSlider previous={t.previous} next={t.next} arrows="edge">
            {reviews.map((review) => (
              <div key={review.id} className={slide}>
                <Review review={review} t={t} />
              </div>
            ))}
          </FeaturedSlider>
          <p className="mt-5 text-[13px] font-light leading-[18px] text-faint lg:pl-5">
            {t.sourceNote} <GoogleMaps />
          </p>
        </>
      )}
    </section>
  );
}
