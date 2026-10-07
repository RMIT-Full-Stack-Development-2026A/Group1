/**
 * TestimonialsMarquee — user-review cards, continuous right-to-left scroll.
 *
 * Same seamless-loop technique as MarqueeBand (CSS `transform: translateX`
 * keyframe, content duplicated exactly twice so the loop point at -50%
 * lines up pixel-perfect with no visible jump), applied to wider card
 * content instead of short text chips. Pauses on hover; snaps to the
 * static final frame when the user prefers reduced motion.
 */

import PropTypes from "prop-types";
import { TESTIMONIALS } from "../service/welcomeContent.service";

function TestimonialCard({ name, role, quote }) {
  return (
    <figure className="flex w-80 shrink-0 flex-col gap-4 rounded-lg border border-[#3d484d] bg-[#1a1a28]/80 p-6">
      <blockquote className="font-body text-sm leading-relaxed text-[#e3e0f4]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto">
        <div className="font-headline text-xs text-[#4cc9f0]">{name}</div>
        <div className="font-body text-xs text-[#93e2ff]/70">{role}</div>
      </figcaption>
    </figure>
  );
}

TestimonialCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
};

export default function TestimonialsMarquee({ reducedMotion = false }) {
  if (reducedMotion) {
    return (
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <TestimonialCard key={item.id} {...item} />
        ))}
      </div>
    );
  }

  // Exactly two copies back-to-back: the track's "to" keyframe (-50%)
  // lands precisely on the start of the second copy, so the loop is seamless.
  const cards = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="w-full overflow-hidden py-2">
      <div className="welcome-testimonials-track flex w-max gap-6">
        {cards.map((item, index) => (
          <TestimonialCard key={`${item.id}-${index}`} {...item} />
        ))}
      </div>
    </div>
  );
}

TestimonialsMarquee.propTypes = {
  reducedMotion: PropTypes.bool,
};
