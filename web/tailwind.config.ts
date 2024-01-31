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
          // "signature-100": "#466AE9",
          "signature-100": "#355CE9",
          "signature-200": "#2C3D95",
          "complement-100": "#40E4D8",
          "red-100": "#DC5068",
          "orange-100": "#EF8C34",
          "yellow-100": "#F2BF3C",
          "green-100": "#17B4A1",
          "blue-100": "#00B2FF",
          "indigo-100": "#2B46A9",
          "purple-100": "#8C67F6",
        },
        //Original palette
        // primary: {
        //   100: "#F1F1F7",
        //   200: "#D1D0DB",
        //   300: "#B7B5C5",
        //   400: "#9C9AAE",
        //   500: "#7D7B92",
        //   600: "#626076",
        //   700: "#403E54",
        //   800: "#343344",
        //   900: "#23222E",
        //   1000: "#0D0D13",
        // },
        //Slightly darker palette
        primary: {
          100: "#F1F1F7",
          200: "#D1D0DB",
          300: "#B7B5C5",
          400: "#9C9AAE",
          500: "#7D7B92",
          600: "#575168",
          700: "#3C3950",
          800: "#29263B",
          900: "#171528",
          1000: "#050510",
        },
      },
    },
  },
  plugins: [],
};
export default config;
