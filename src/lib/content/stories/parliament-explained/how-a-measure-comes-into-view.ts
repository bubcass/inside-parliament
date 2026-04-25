import type { Story } from "../../types";

export const europeanMeasuresExplained: Story = {
  slug: "european-measures-explained",
  section: "parliament-explained",
  heroLayout: "immersive",
  eyebrow: "Learning Hub",
  title: "How is the Ceann Comhairle elected?",
  dek: "The election of the Ceann Comhairle is the first business conducted by a newly elected Dáil.\nSince 2016, the process has been a secret ballot of Members.",
  byline: "David Cass",
  date: "April 14, 2026",
  readingTime: "7 min read",
  hero: {
    src: "/media/ceann_comhairle_election.jpg",
    alt: "The Ceann Comhairle, Deputy Verona Murphy, on being elected in 2024.",
  },
  blocks: [
    {
      type: "text",
      heading: "From Paper to Question",
      paragraphs: [
        "The first version of a European measure may look remote from daily political life. Its language is procedural, its consequences indirect and its route through domestic institutions easy to miss.",
        "The Seanad’s scrutiny role gives that process a public point of entry. Members can ask what a proposal changes, who it affects and whether the State’s response is clear enough before decisions harden.",
      ],
    },
    {
      type: "media-text",
      eyebrow: "Motion insert",
      heading: "When a short clip is enough",
      paragraphs: [
        "A compact media row can hold a short motion plate beside the explanation. It gives the page visual rhythm without asking the reader to enter a full-screen chapter.",
      ],
      mediaSide: "left",
      media: {
        type: "video",
        asset: {
          src: "/media/transparency_seanad.mp4",
          poster: "/media/full_chamber.jpg",
          caption:
            "Video in this block follows the same muted, looping editorial default as the full-width video block.",
        },
      },
    },
    {
      type: "text",
      heading: "The Value of Delay",
      paragraphs: [
        "Scrutiny can look like delay from the outside. Inside the process, delay can be the mechanism that lets a committee notice ambiguity, request clarification and make a technical proposal legible to a wider public.",
      ],
    },
    {
      type: "quote",
      text: "The important thing is not just whether a measure passes, but whether anyone has understood what it asks the State to do.",
      attribution: "Former committee member",
    },
  ],
};

export default europeanMeasuresExplained;
