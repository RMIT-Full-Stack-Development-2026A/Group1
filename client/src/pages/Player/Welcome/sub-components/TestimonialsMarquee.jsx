/**
 * TestimonialsMarquee — user-review cards, continuous right-to-left scroll.
 *
 * Same seamless-loop technique as MarqueeBand (CSS `transform: translateX`
 * keyframe, content duplicated exactly twice so the loop point at -50%
 * lines up pixel-perfect with no visible jump), applied to wider card
 * content instead of short text chips. Pauses on hover; snaps to the
 * static final frame when the user prefers reduced motion.
 *
 * Avatars are served from client/public/avatars/ (see README there), not a static
 * import, so a missing file falls back to a placeholder person icon via onError.
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { TESTIMONIALS } from "../service/welcomeContent.service";

function TestimonialAvatar({ src, name }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#3d484d] bg-[#1e1e2c]">
        <span className="material-symbols-outlined text-xl text-[#3d484d]">person</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={44}
      height={44}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className="h-11 w-11 shrink-0 rounded-full border border-[#3d484d] object-cover"
    />
  );
}

TestimonialAvatar.propTypes = {
  src: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

function TestimonialCard({ name, role, quote, avatar }) {
  return (
    <figure className="flex w-80 shrink-0 flex-col gap-4 rounded-lg border border-[#3d484d] bg-[#1a1a28]/80 p-6">
      <blockquote className="font-body text-sm leading-relaxed text-[#e3e0f4]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <TestimonialAvatar src={avatar} name={name} />
        <div>
          <div className="font-headline text-xs text-[#4cc9f0]">{name}</div>
          <div className="font-body text-xs text-[#93e2ff]/70">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

TestimonialCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
};

export default function TestimonialsMarquee({ reducedMotion = false }) {
  const heading = (
    <h2 className="font-headline text-xl md:text-3xl text-[#e3e0f4] text-center uppercase mb-10">
      User Reviews
    </h2>
  );

  if (reducedMotion) {
    return (
      <div className="flex w-full flex-col items-center">
        {heading}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    );
  }

  // Exactly two copies back-to-back: the track's "to" keyframe (-50%)
  // lands precisely on the start of the second copy, so the loop is seamless.
  const cards = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="flex w-full flex-col items-center">
      {heading}
      <div className="w-full overflow-hidden py-2">
        <div className="welcome-testimonials-track flex w-max gap-6">
          {cards.map((item, index) => (
            <TestimonialCard key={`${item.id}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

TestimonialsMarquee.propTypes = {
  reducedMotion: PropTypes.bool,
};
