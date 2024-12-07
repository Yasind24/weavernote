/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    plugin(function({ addBase, addComponents, addUtilities }) {
      addBase({
        ':root': {
          '--sidebar-width': '16rem',
          '--sidebar-width-collapsed': '4rem',
        },
        'body': {
          '@apply text-gray-900 bg-gray-50': {},
        },
      });

      addComponents({
        '.prose': {
          '@apply max-w-none': {},
          'p': {
            '@apply mb-4': {},
          },
          'ul': {
            '@apply list-disc pl-6 mb-4': {},
          },
          'ol': {
            '@apply list-decimal pl-6 mb-4': {},
          },
          'h1': {
            '@apply text-2xl font-bold mb-4': {},
          },
          'h2': {
            '@apply text-xl font-bold mb-3': {},
          },
          'blockquote': {
            '@apply border-l-4 border-gray-300 pl-4 italic my-4': {},
          },
          'table': {
            '@apply w-full border-collapse my-4': {},
            'td, th': {
              '@apply border-2 border-gray-200 p-2': {},
            },
            'th': {
              '@apply bg-gray-50 font-semibold': {},
            },
            'tr': {
              '@apply border-b border-gray-200': {},
            },
          },
          'code': {
            '@apply font-mono text-sm bg-[#0d1117] text-[#e6edf3] px-1.5 py-0.5 rounded': {},
          },
          'pre': {
            '@apply p-0 my-4 bg-[#0d1117] rounded-lg': {},
            'code': {
              '@apply block p-4 overflow-x-auto text-[#e6edf3] whitespace-pre': {},
            },
          },
        },
      });

      addUtilities({
        '.ProseMirror': {
          '@apply outline-none h-full scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400': {},
        },
        '.ProseMirror p.is-editor-empty:first-child::before': {
          'color': '#9ca3af',
          'content': 'attr(data-placeholder)',
          'float': 'left',
          'height': '0',
          'pointer-events': 'none',
        },
        '.highlight': {
          '@apply rounded px-1.5 py-0.5': {},
        },
        '.highlight[style*="background-color: #fef08a"]': {
          '@apply text-yellow-900': {},
        },
        '.highlight[style*="background-color: #bbf7d0"]': {
          '@apply text-green-900': {},
        },
        '.highlight[style*="background-color: #bfdbfe"]': {
          '@apply text-blue-900': {},
        },
        '.highlight[style*="background-color: #fbcfe8"]': {
          '@apply text-pink-900': {},
        },
        '.highlight[style*="background-color: #fed7aa"]': {
          '@apply text-orange-900': {},
        },
        'ul[data-type="taskList"]': {
          '@apply list-none p-0': {},
          'li': {
            '@apply flex items-start gap-2 my-2': {},
            '> label': {
              '@apply mt-[5px]': {},
            },
            '> div': {
              '@apply flex-1': {},
            },
            '> label input[type="checkbox"]': {
              '@apply w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500': {},
            },
          },
        },
        '.fullscreen-editor': {
          '@apply fixed inset-0 bg-white z-50': {},
          '.ProseMirror': {
            '@apply min-h-0': {},
          },
        },
        '.prose-code-block': {
          '@apply font-mono text-[0.9em] leading-relaxed': {},
          'code': {
            '@apply block overflow-x-auto p-4 whitespace-pre bg-[#0d1117] text-[#e6edf3] rounded-lg': {},
          },
        },
        '.ProseMirror': {
          'pre': {
            '@apply bg-[#0d1117] rounded-lg text-[#e6edf3] p-3 my-2 whitespace-pre overflow-x-auto': {},
            'code': {
              '@apply font-mono text-sm leading-relaxed': {},
            }
          },
          'code': {
            '@apply font-mono text-sm leading-relaxed bg-[#0d1117] text-[#e6edf3] px-1.5 py-0.5 rounded': {},
          },
          'table': {
            '@apply w-full border-collapse my-4 table-fixed overflow-hidden': {},
            'td, th': {
              '@apply border-2 border-gray-200 p-2 relative align-top': {},
            },
            'th': {
              '@apply bg-gray-50 font-bold': {},
            },
          },
          '.selectedCell:after': {
            '@apply absolute inset-0 pointer-events-none z-10 bg-blue-100/40': {},
            'content': '""',
          },
        },
      });
    }),
  ],
}