/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,jsx,ts,tsx}", 
    "./src/app/tabs/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
    "./src/constants/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    colors: {
      "rose": "#e8a0a0",                 /* Primary : main navigation and buttons */
      "blush": "#f3d4d4",                /* Secondary : secondary actions, toggles, interactions*/
      "dusty-rose":"#c97b7b",            /* Accent : notifications, new item badges, focused borders*/      
      "white" : "#ffffff",           /* Background : main app background, content areas */
      "white-smoke": "#f2f2f2",      /* Surface : cards for clothing items, pop ups*/
      "graphite": "#333333",         /* Text : al primary text, headings and labels*/
      "slate-gray": "#757575",       /* Text secondary: helper text, timestamps, placeholders */
      "silver": "#b0b0b0",           /* Text disabled: disabled inputs/buttons */
      "border": "#d9d9d9",           /* Default borders */
      "error": "#d64545",
      "success": "#4caf82",
      "warning": "#e0a940",
      "info": "#5b9bd5",
      "link": "#5b9bd5"
    },
  },
  plugins: [],
};