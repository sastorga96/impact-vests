// Everything you are likely to change lives in this one file.
// The logo artwork is in /brand (swap those SVG/PNG files if the name changes).
window.SITE = {
  // Bump this whenever you replace a vest image (same filename) so browsers fetch the new one
  imgVersion: 7,

  brand: {
    name: "Stinger",
    tagline: "Impact Vests",
    contactEmail: "", // shown in the footer and FAQ when set
  },

  preorder: {
    season: "Summer 2027",
    price: 149,          // pre-order price in USD
    unlockAt: 50,        // reservations a print needs before it goes into production
    sizes: ["S", "M", "L", "XL", "XXL"],
  },

  // Form backend. Create a free form at https://formspree.io (or any service that
  // accepts a POST and emails you), then paste its endpoint here, e.g.
  // "https://formspree.io/f/abcdwxyz". Both forms can share one endpoint;
  // each entry carries a "form" field so you can tell them apart.
  // While this is empty the forms say reservations are not open yet.
  formEndpoint: "",

  designs: [
    {
      id: "race97",
      img: "waverace",
      name: "Race '97",
      kicker: "90s race livery",
      blurb: "Teal, purple and hot-pink slashes on bright white, a checkered hem and a big #97 race plate on the back. Looks fast parked at the dock.",
      glow: "#19B3A6",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "cheetah",
      img: "cheetah",
      name: "Cheetah",
      kicker: "Big cat, edge to edge",
      blurb: "Classic big-cat rosettes wrapped around the whole vest from zipper to side seams. Mustard yellow with a hot-pink lining, or white with caramel-centred rosettes. Quiet it is not.",
      glow: "#EAC224",
      // Colour options: the first is the default. Each needs img/<img>-front.webp, -detail.jpg, -print.jpg (and -back.webp unless noBack)
      colors: [
        { name: "Mustard", img: "cheetah", swatch: "#EAC224" },
        { name: "White", img: "cheetah-white", swatch: "#F2F0EB", glow: "#E8E2D6" },
      ],
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "usa96",
      img: "usa",
      name: "USA '96",
      kicker: "Summer of '96 Americana",
      blurb: "A navy star field, waving red and white stripes and one USA hit on the left chest. Built for the Fourth and every weekend near it.",
      glow: "#3A5BD9",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "usajersey96",
      img: "usajersey",
      name: "USA '96 Jersey",
      kicker: "90s team jersey",
      blurb: "Navy mesh body, red side panels with white stars running up both sides and a brush-script USA riding a red swoosh across the chest. Red trim and lining. No number, all team.",
      glow: "#C8102E",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "memphis88",
      img: "memphis",
      name: "Memphis '88",
      kicker: "80s sprinkle confetti",
      blurb: "Black sprinkle confetti on bright white with big red, cobalt, yellow, teal, lime and hot-pink shapes, each one casting a hard black shadow. Pure Saturday-morning 1988.",
      glow: "#2547D0",
      noBack: true, // no back photo yet: hide the back view
    },

    {
      id: "jetset94",
      img: "jetset94",
      name: "Jet Set '94",
      kicker: "90s jet ski colorblock",
      blurb: "A teal-and-mint lightning bolt splits purple tiger stripes from halftone hot pink, with sun-yellow dry-brush splash and shards flying off every kink. Straight off a '94 trailer.",
      glow: "#2BD9C6",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "tigerfade",
      img: "tigerfade",
      name: "Tiger Fade",
      kicker: "Hot pink to purple, tiger striped",
      blurb: "A hot-pink-to-purple fade clawed with plum tiger stripes, each one rimmed in neon pink, over a sun-yellow pinstripe. Loud from the dock, louder up close.",
      glow: "#E040C0",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "splashzone",
      img: "splashzone",
      name: "Splash Zone",
      kicker: "Paint splats on lemon yellow",
      blurb: "Lemon yellow hit with hot-pink, teal and purple paint splats, drips and dry-brush streaks, plus black speed slashes. Looks like it went through the spray at full throttle.",
      glow: "#FFD400",
      noBack: true, // no back photo yet: hide the back view
    },
    {
      id: "shardburst",
      img: "shardburst",
      name: "Shard Burst",
      kicker: "Exploding shards on white",
      blurb: "A burst of teal, mint, pink, purple and sun-yellow shards blasting off the chest, with halftone rings, speed lines and a purple hull and yoke.",
      glow: "#3FD9A0",
      noBack: true, // no back photo yet: hide the back view
    },

    {
      id: "southbeach89",
      img: "southbeach",
      name: "South Beach '89",
      kicker: "Miami pastel speed streaks",
      blurb: "Bubblegum pink and sky blue speed streaks with black keylines tearing across bright white, shattering into shards over pastel palms. A hot-pink lining finishes it off.",
      glow: "#F55BAA",
      noBack: true, // no back photo yet: hide the back view
    },

    {
      id: "antelope92",
      img: "antelope",
      name: "Antelope '92",
      kicker: "Fawn hide, spine to sides",
      blurb: "A warm tan hide with a dark stripe running down the spine and soft white spots fanning out in chevrons toward the sides. Cream lining, black zipper. Wild without shouting.",
      glow: "#B08A66",
      noBack: true, // no back photo yet: hide the back view
    },

    // Off the site until it has a photo-mapped front (images stay in img/miami-*):
    // {
    //   id: "oceandrive85",
    //   img: "miami",
    //   name: "Ocean Drive '85",
    //   kicker: "80s Miami neon",
    //   blurb: "A striped sunset over a hot-pink horizon grid, teal neon palms and a glowing flamingo, all on midnight purple. Pastel suit not included.",
    //   glow: "#FF2E97",
    // },
  ],
};
