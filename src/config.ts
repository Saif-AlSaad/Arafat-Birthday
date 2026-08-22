/**
 * ✏️  EDIT ME!
 * Everything you want to personalise lives in this one file.
 * Change the text, save, and the card updates instantly.
 */

export type Gift = {
  id: number;
  emoji: string;
  boxColor: string;
  ribbonColor: string;
  title: string;
  description: string;
  code: string;
};

export const config = {
  /* The birthday boy 👦 */
  brotherName: "Arafat",
  age: 10,

  /* Who the card is from 💌 */
  fromName: "Your Didi",

  /* The headline shown after the envelope opens */
  headline: "HAPPY BIRTHDAY",

  /* A short, sweet personal letter (shown with a handwriting font) */
  letter:
    "Happy 10th birthday, Arafat! Double digits — you're officially a big kid now. " +
    "I'm so proud of the funny, kind and super-smart person you're becoming. " +
    "Make a wish, enjoy your surprises, and remember that today is all about you. " +
    "Love you tons! ❤️",

  /* Three surprise gifts hidden inside the boxes 🎁 */
  gifts: [
    {
      id: 1,
      emoji: "🍕",
      boxColor: "#ff5d73",
      ribbonColor: "#ffd93d",
      title: "PIZZA PARTY!",
      description:
        "One large pizza with ANY toppings you want — plus a big bottle of cold drink. Your day, your menu!",
      code: "PIZZA-NIGHT",
    },
    {
      id: 2,
      emoji: "🎮",
      boxColor: "#4d96ff",
      ribbonColor: "#ffffff",
      title: "GAME TIME",
      description:
        "2 extra hours of video games this weekend — no interruptions, no 'log off now'!",
      code: "EXTRA-LIFE",
    },
    {
      id: 3,
      emoji: "🎬",
      boxColor: "#8e6bff",
      ribbonColor: "#6bcB77",
      title: "MOVIE NIGHT",
      description:
        "Movie + popcorn + ice cream with me. You pick the film, even if we've watched it 100 times.",
      code: "MOVIE-BUDDY",
    },
  ] as Gift[],

  /* Fun facts / reasons he's awesome ✨ */
  reasons: [
    { emoji: "⚽", text: "You can kick a football harder than anyone I know" },
    { emoji: "🧠", text: "You beat me at maths sometimes (don't tell anyone)" },
    { emoji: "😂", text: "Your jokes actually make me snort-laugh" },
    { emoji: "🦸", text: "You're the bravest 10-year-old in the whole world" },
  ],

  /* Footer */
  footerNote: "Made with 💛, glitter and a lot of cake",
};
