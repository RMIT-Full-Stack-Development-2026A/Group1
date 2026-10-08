import { useState } from 'react';

const PARTICLE_COUNT = 16;

const ANIMATION_CLASS = {
    drift: 'animate-particle-drift',
    fall: 'animate-particle-fall',
    swing: 'animate-particle-swing',
};

const createParticles = (theme) =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const duration = theme.particleDurMin + Math.random() * (theme.particleDurMax - theme.particleDurMin);
        const delay = Math.random() * theme.particleDurMax;
        const size = theme.particleSizeMin + Math.random() * (theme.particleSizeMax - theme.particleSizeMin);
        const alpha = 0.25 + Math.random() * 0.4;

        return {
            id: i,
            left: `${(i / PARTICLE_COUNT) * 100 + Math.random() * 4}%`,
            size: `${size}px`,
            color: `${theme.particleColor}${alpha.toFixed(2)})`,
            duration: duration.toFixed(1),
            delay: delay.toFixed(1),
        };
    });

export default function ParticleLayer({ theme }) {
    const animClass = ANIMATION_CLASS[theme.particleType] ?? ANIMATION_CLASS.drift;

    // Randomized once when the layer mounts (Math.random must not run while rendering).
    const [particles] = useState(() => createParticles(theme));

    return (
        <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
                <span
                    key={particle.id}
                    className={`absolute top-[-20px] select-none ${animClass}`}
                    style={{
                        left: particle.left,
                        fontSize: particle.size,
                        color: particle.color,
                        animationDuration: `${particle.duration}s`,
                        animationDelay: `${particle.delay}s`,
                    }}
                >
                    {theme.particleShape}
                </span>
            ))}
        </div>
    );
}