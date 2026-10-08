/**
 * Material Symbols icon. The whole app uses this one icon family.
 * Decorative by default (hidden from assistive tech): give the surrounding control a text label or aria-label.
 *
 * @param {string} name - Material Symbols ligature, e.g. "close", "person", "volume_up".
 * @param {number} [size=24] - Pixel size.
 * @param {string} [color] - CSS color; omit to inherit the text color.
 * @param {boolean} [filled=false] - Filled glyph variant.
 */
export default function Icon({ name, size = 24, color, filled = false, className = "", style, ...rest }) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-outlined shrink-0 select-none ${className}`}
            style={{
                fontSize: size,
                width: size,
                height: size,
                lineHeight: 1,
                color,
                fontVariationSettings: filled ? "'FILL' 1" : undefined,
                ...style,
            }}
            {...rest}
        >
            {name}
        </span>
    );
}
