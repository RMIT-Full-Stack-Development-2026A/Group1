/**
 * GameModeCard Component
 * Displays an individual game mode card with title, description, and action button
 */

import React from 'react';
import PropTypes from 'prop-types';

const GameModeCard = ({ mode, onSelect }) => {
  const {
    id,
    title,
    description,
    icon,
    accentColor,
    buttonText,
    buttonIcon,
    buttonStyle,
    badge,
    glowEffect,
    topBarColor,
  } = mode;

  const handleClick = () => {
    onSelect(id);
  };

  return (
    <div
      className={`group relative bg-surface border-2 border-outline-variant p-8 flex flex-col items-center text-center transition-all hover:border-primary-container ${
        glowEffect ? 'glow-cyan' : ''
      } chunky-offset`}
    >
      {/* Top Color Bar */}
      <div className={`w-full h-1 ${topBarColor} absolute top-0 left-0`}></div>

      {/* Active Badge (only displayed when badge prop exists) */}
      {badge && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-surface-container border border-outline-variant rounded-none">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#4cc9f0', boxShadow: '0 0 5px #4cc9f0' }}
          ></span>
          <span className="text-primary-container text-[8px] font-bold">{badge}</span>
        </div>
      )}

      {/* Icon */}
      <div className="mb-8 mt-4" style={{ color: accentColor }}>
        <span
          className="material-symbols-outlined block text-7xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-headline text-lg mb-6 text-on-surface">{title}</h2>

      {/* Description */}
      <p className="text-on-surface-variant text-sm leading-relaxed mb-10 h-12">{description}</p>

      {/* Button */}
      <div className="mt-auto w-full">
        <button
          onClick={handleClick}
          className={`w-full py-4 font-headline text-[10px] transition-all flex items-center justify-center gap-2 chunky-offset-active ${
            buttonStyle === 'filled'
              ? 'bg-primary-container text-on-primary hover:drop-shadow-[0_0_8px_rgba(76,201,240,0.4)]'
              : 'border-2 border-primary-container text-primary-container hover:bg-primary-container/10'
          } ${glowEffect && buttonStyle === 'filled' ? 'button-glow' : ''}`}
          aria-label={`Select ${title} game mode`}
        >
          {buttonText}
          <span className="material-symbols-outlined text-sm">{buttonIcon}</span>
        </button>
      </div>
    </div>
  );
};

GameModeCard.propTypes = {
  mode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    accentColor: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    buttonIcon: PropTypes.string.isRequired,
    buttonStyle: PropTypes.oneOf(['filled', 'outlined']).isRequired,
    badge: PropTypes.string,
    glowEffect: PropTypes.bool,
    topBarColor: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

GameModeCard.defaultProps = {
  badge: null,
  glowEffect: false,
};

export default GameModeCard;
