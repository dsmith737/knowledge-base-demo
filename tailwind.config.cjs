//@ts-check

const styleguidePlugin = require('./tailwindPlugin.cjs');

/** @type {import('tailwindcss/types/config').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./node_modules/@yext/search-ui-react/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "text": "black",
        "brand-primary": "#1B78D0",
        "brand-secondary": "#073866",
        "brand-blue": "#0F70F0",
        "brand-gray": {
          100: "#F7F8F8",
          200: "#EEEFF0",
          300: "#E4E8EC",
          400: "#DADCE0",
          500: "#757575",
          600: "#555555",
          700: "#272D39",
        }
      },
      buttons: ({ theme }) => {
        /** @type {import('./tailwind').ButtonConfig} */
        const buttonStyles = {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          variants: {
            primary: {
              borderRadius: '1000px',
              backgroundColor: 'white',
              color: theme('colors.text'),
              border: `1px solid ${theme('colors.brand-gray.700')}`,
              '&:hover': {
                backgroundColor: theme('colors.brand-gray.700'),
                color: "white",
              }
            },
            secondary: {
              borderRadius: '5px',
              backgroundColor: theme('colors.brand-gray.200'),
              '&:hover': {
                backgroundColor: theme('colors.brand-gray.400'),
              }
            }
          }
        }
        return buttonStyles;
      },
      fontFamily: {
        primary: "'Lato','Helvetica','sans-serif','system'",
        secondary: "'Lato','Helvetica','sans-serif','system'",
      },
      links: ({ theme }) => ({
        primary: {
          color: theme('colors.brand-primary'),
          hoverColor: theme('colors.brand-secondary'),
        },
        secondary: {
          color: theme('colors.brand-secondary'),
          hoverColor: theme('colors.brand-primary'),
        },
      }),
      headings: {
        kb: ['24px', { lineHeight: '26px' }],
        kbMobile: ['14px', { lineHeight: '16px' }],
        lead: ['50px', { lineHeight: '55px' }],
        leadMobile: ['40px', { lineHeight: '45px' }],
        head: ['28px', { lineHeight: '35px' }],
        headMobile: ['28px', { lineHeight: '35px' }],
        sub: ['24px', { lineHeight: '26px' }],
        subMobile: ['24px', { lineHeight: '26px' }],
        flag: ['20px', { lineHeight: '30px' }],
        flagMobile: ['20px', { lineHeight: '30px' }],
        brow: ['14px', { lineHeight: '20px' }],
        browMobile: ['14px', { lineHeight: '20px' }],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
        },
      },
      boxShadow: {
        "brand-shadow": "0 -1px 0 0 #CCC inset",
        "card-shadow": "0 0 10px 3px rgba(0, 0, 0, 0.24)",
      }
    },
  },
  plugins: [
    styleguidePlugin(),
  ],
};