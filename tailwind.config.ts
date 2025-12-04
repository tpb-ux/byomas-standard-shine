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
        forest: {
          dark: "hsl(var(--forest-dark))",
          medium: "hsl(var(--forest-medium))",
        },
        ocean: {
          blue: "hsl(var(--ocean-blue))",
          light: "hsl(var(--ocean-light))",
        },
        earth: {
          gold: "hsl(var(--earth-gold))",
        },
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-accent': 'var(--gradient-accent)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-card)',
      },
      transitionProperty: {
        'smooth': 'var(--transition-smooth)',
      },
      letterSpacing: {
        'kinexys': '0.02em',
        'label': '0.15em',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(0 0% 100% / 0.9)',
            '--tw-prose-headings': 'hsl(0 0% 100%)',
            '--tw-prose-lead': 'hsl(220 10% 60%)',
            '--tw-prose-links': 'hsl(165 100% 42%)',
            '--tw-prose-bold': 'hsl(0 0% 100%)',
            '--tw-prose-counters': 'hsl(220 10% 60%)',
            '--tw-prose-bullets': 'hsl(165 100% 42%)',
            '--tw-prose-hr': 'hsl(220 15% 24%)',
            '--tw-prose-quotes': 'hsl(0 0% 100%)',
            '--tw-prose-quote-borders': 'hsl(165 100% 42%)',
            '--tw-prose-captions': 'hsl(220 10% 60%)',
            '--tw-prose-code': 'hsl(165 100% 42%)',
            '--tw-prose-pre-code': 'hsl(0 0% 100%)',
            '--tw-prose-pre-bg': 'hsl(220 18% 10%)',
            '--tw-prose-th-borders': 'hsl(220 15% 24%)',
            '--tw-prose-td-borders': 'hsl(220 15% 24%)',
            'h1': {
              fontWeight: '300',
              letterSpacing: '0.02em',
              marginTop: '2em',
              marginBottom: '0.8em',
            },
            'h2': {
              fontWeight: '300',
              letterSpacing: '0.02em',
              marginTop: '1.8em',
              marginBottom: '0.6em',
            },
            'h3': {
              fontWeight: '400',
              letterSpacing: '0.01em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            'p': {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
          },
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
