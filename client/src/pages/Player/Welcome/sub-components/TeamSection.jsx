/**
 * TeamSection — new section (07/10, Khanh)
 * Dedicated team introduction, separate from FeatureGrid. 5 member slots:
 * photo (placeholder circle until Khanh adds real photos), name, role, and
 * a clickable GitHub profile link.
 */

import { motion } from "framer-motion";
import { TEAM_MEMBERS } from "../service/welcomeContent.service";

const MotionDiv = motion.div;

export default function TeamSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20">
      <h2 className="font-headline text-xl md:text-2xl text-[#e3e0f4] text-center uppercase mb-12">
        Meet the Team
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
        {TEAM_MEMBERS.map((member, index) => (
          <MotionDiv
            key={member.id}
            className="flex flex-col items-center text-center gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#3d484d] bg-[#1e1e2c] flex items-center justify-center overflow-hidden">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-4xl text-[#3d484d]">
                  person
                </span>
              )}
            </div>
            <h3 className="font-headline text-xs text-[#e3e0f4] uppercase">{member.name}</h3>
            <p className="text-xs text-[#bcc8ce]">{member.role}</p>
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 text-[#93e2ff] hover:text-[#4cc9f0] transition-colors"
              aria-label={`${member.name}'s GitHub profile`}
            >
              <span className="material-symbols-outlined text-base">code</span>
              <span className="text-xs font-headline uppercase">GitHub</span>
            </a>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
