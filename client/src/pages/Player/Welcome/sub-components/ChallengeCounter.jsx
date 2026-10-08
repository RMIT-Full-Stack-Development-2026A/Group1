/**
 * ChallengeCounter — Section
 * 07/10 update (Khanh): dropped the "Can you beat the AI on Hard?" heading
 * and the SplitFlapDisplay (airport-board flip didn't fit the page's
 * vibe here). Now just a simple real match count, fetched from the
 * backend (GET /games/stats/total) — still no mock number.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTotalMatchesPlayed } from "../service/gameStats.service";

const MotionP = motion.p;

export default function ChallengeCounter() {
  const [totalMatches, setTotalMatches] = useState(null); // null while loading

  useEffect(() => {
    let isMounted = true;
    getTotalMatchesPlayed()
      .then((total) => {
        if (isMounted) setTotalMatches(total);
      })
      .catch(() => {
        if (isMounted) setTotalMatches(0);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-16 text-center flex flex-col items-center gap-3">
      <MotionP
        className="font-headline text-4xl md:text-6xl text-[#4cc9f0] [text-shadow:0_0_20px_rgba(76,201,240,0.4)]"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4 }}
      >
        {totalMatches === null ? "—" : totalMatches.toLocaleString()}
      </MotionP>
      <p className="font-headline text-xs md:text-sm text-[#bcc8ce] uppercase tracking-widest">
        Matches Played
      </p>
    </section>
  );
}
