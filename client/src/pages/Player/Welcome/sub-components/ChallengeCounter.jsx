/**
 * ChallengeCounter — Section 6
 * 07/10 update (Khanh): no more mock number. Fetches the real total match
 * count from the backend (GET /games/stats/total) and displays it through
 * the ported SplitFlapDisplay (componentry.dev) airport-scoreboard effect.
 */

import { useEffect, useState } from "react";
import SplitFlapDisplay from "./SplitFlapDisplay";
import { getTotalMatchesPlayed } from "../service/gameStats.service";
import { CHALLENGE_STAT } from "../service/welcomeContent.service";

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

  const displayValue = totalMatches === null ? "" : String(totalMatches);

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-8">
      <h2 className="font-headline text-lg md:text-xl text-[#e3e0f4] uppercase">
        {CHALLENGE_STAT.label}
      </h2>
      <SplitFlapDisplay
        rows={[{ label: "MATCHES PLAYED", value: displayValue }]}
        columns={20}
        size="sm"
        accentColor="#fad100"
      />
    </section>
  );
}
