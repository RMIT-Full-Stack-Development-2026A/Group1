/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary": "#4e2600",
        "on-tertiary-fixed-variant": "#6f3800",
        "on-surface-variant": "#bcc8ce",
        "secondary": "#fff0c4",
        "error": "#ffb4ab",
        "surface": "#12121f",
        "inverse-surface": "#e3e0f4",
        "surface-container": "#1e1e2c",
        "surface-tint": "#5bd5fc",
        "surface-container-highest": "#343342",
        "tertiary-fixed-dim": "#ffb780",
        "primary-fixed-dim": "#5bd5fc",
        "tertiary-container": "#fba866",
        "surface-container-high": "#292937",
        "secondary-container": "#fad100",
        "on-primary-fixed-variant": "#004e61",
        "secondary-fixed-dim": "#e9c400",
        "on-error-container": "#ffdad6",
        "outline": "#879398",
        "primary-fixed": "#b7eaff",
        "on-primary": "#003543",
        "on-tertiary-fixed": "#2f1400",
        "on-tertiary-container": "#753b00",
        "background": "#12121f",
        "on-secondary-fixed-variant": "#554600",
        "tertiary": "#ffcca9",
        "on-secondary-fixed": "#221b00",
        "inverse-on-surface": "#2f2f3d",
        "outline-variant": "#3d484d",
        "on-background": "#e3e0f4",
        "surface-dim": "#12121f",
        "surface-container-low": "#1a1a28",
        "primary-container": "#4cc9f0",
        "on-surface": "#e3e0f4",
        "on-error": "#690005",
        "surface-variant": "#343342",
        "primary": "#93e2ff",
        "tertiary-fixed": "#ffdcc4",
        "on-primary-fixed": "#001f28",
        "error-container": "#93000a",
        "secondary-fixed": "#ffe171",
        "on-secondary-container": "#6d5a00",
        "surface-container-lowest": "#0d0d1a",
        "on-primary-container": "#005266",
        "inverse-primary": "#006780",
        "surface-bright": "#383847",
        "on-secondary": "#3b2f00"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "0px"
      },
      fontFamily: {
        "headline": ["'Press Start 2P'", "cursive"],
        "body": ["'IBM Plex Mono'", "monospace"],
        "label": ["'IBM Plex Mono'", "monospace"],
        "arcade": ["'Press Start 2P'", "cursive"]
      },
      animation: {
        fadeOut: "fadeOut 4s ease-in-out forwards",
        'particle-drift': 'particleDrift 10s linear infinite',
        'particle-fall': 'particleFall 7s linear infinite',
        'particle-swing': 'particleSwing 9s linear infinite',
        'typing-bounce': 'typingBounce 1.2s ease-in-out infinite'
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "75%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        particleDrift: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0' }
        },
        particleFall: {
          '0%': { transform: 'translateY(-20px) scale(1)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(110vh) scale(0.4)', opacity: '0' }
        },
        particleSwing: {
          '0%': { transform: 'translateY(-20px) translateX(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(55vh) translateX(28px)' },
          '100%': { transform: 'translateY(110vh) translateX(-20px)', opacity: '0' }
        },
        typingBounce: {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-4px)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}
