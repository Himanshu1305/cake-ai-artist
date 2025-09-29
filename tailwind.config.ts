import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom cake theme colors
        gold: {
          DEFAULT: "hsl(var(--gold))",
          muted: "hsl(var(--gold-muted))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
        },
        party: {
          pink: "hsl(var(--party-pink))",
          purple: "hsl(var(--party-purple))",
          coral: "hsl(var(--party-coral))",
          mint: "hsl(var(--party-mint))",
        },
      },
      backgroundImage: {
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-party': 'var(--gradient-party)',
        'gradient-celebration': 'var(--gradient-celebration)',
      },
      boxShadow: {
        'elegant': 'var(--shadow-elegant)',
        'gold': 'var(--shadow-gold)',
        'party': 'var(--shadow-party)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "flame-flicker": {
          "0%, 100%": {
            transform: "scale(1) rotate(-1deg)",
            opacity: "1",
          },
          "25%": {
            transform: "scale(1.05) rotate(1deg)",
            opacity: "0.9",
          },
          "50%": {
            transform: "scale(0.95) rotate(-0.5deg)",
            opacity: "1",
          },
          "75%": {
            transform: "scale(1.02) rotate(0.5deg)",
            opacity: "0.95",
          },
        },
        "flame-dance": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "33%": {
            transform: "translateY(-2px) scale(1.02)",
          },
          "66%": {
            transform: "translateY(-1px) scale(0.98)",
          },
        },
        "candle-glow": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(45 100% 60% / 0.5), 0 0 20px hsl(45 100% 60% / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 15px hsl(45 100% 60% / 0.7), 0 0 30px hsl(45 100% 60% / 0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flame-flicker": "flame-flicker 1.5s ease-in-out infinite",
        "flame-dance": "flame-dance 2s ease-in-out infinite",
        "candle-glow": "candle-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
