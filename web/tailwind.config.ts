const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      colors: {
        secondary: {
          "zen-100": "#89E0D7",
          "zen-200": "#61A99C",

          "body-100": "#D6545A",
          "body-200": "#A6363B",

          "mind-100": "#6EA0C2",
          "mind-200": "#386B8E",

          "aura-100": "#B8C9EA",
          "aura-200": "#7D92BC",

          "energy-100": "#E59963",
          "energy-200": "#B86D37",

          "ego-100": "#F3B63E",
          "ego-200": "#D39112",

          "psyche-100": "#A39ED3",
          "psyche-200": "#7873AA",

          "heart-100": "#B21E4A",
          "heart-200": "#6C0A28",

          "soul-100": "#5D677A",
          "soul-200": "#374664",
        },
        primary: {
          100: "#F1F1F7",
          200: "#D1D0DB",
          300: "#B7B5C5",
          400: "#9C9AAE",
          500: "#7D7B92",
          600: "#626076",
          700: "#403E54",
          800: "#343344",
          900: "#23222E",
          1000: "#0D0D13",
        },
      },
    },
  },
  plugins: [],
};
export default config;
