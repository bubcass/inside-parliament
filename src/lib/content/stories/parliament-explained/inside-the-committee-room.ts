import type { Story } from "../../types";

export const committeeRoomNotes: Story = {
  slug: "committee-room-notes",
  section: "parliament-explained",
  featured: true,
  heroLayout: "immersive",
  eyebrow: "Parliament Essentials",
  title: "How do TDs vote in the Dáil?",
  dek: "One of the most fundamental parts of a TDs job is to vote on business brought before the Dáil.\nIt means each Deputy is accountable for the decisions they make on behalf of their constituents.",
  byline: "David Cass",
  date: "April 23, 2026",
  readingTime: "5 min read",
  hero: {
    src: "/media/full_chamber.png",
    alt: "A wide view of the Seanad chamber prepared for parliamentary business.",
    caption:
      "The committee room structure gives longform pages a quieter route into process and scrutiny.",
  },
  blocks: [
    {
      type: "text",
      heading: "The Work Before Debate",
      paragraphs: [
        "Before a measure reaches the chamber floor, much of its meaning has already been shaped by questions, correspondence and committee scrutiny. The work is methodical rather than theatrical, and that is why it often matters.",
        "Officials brief members on technical language, Senators test the practical implications and the committee record becomes a place where small doubts can be made visible before they become larger political arguments.",
      ],
    },
    {
      type: "media-text",
      eyebrow: "Documented process",
      heading: "A contained media moment",
      paragraphs: [
        "This section keeps supporting media within the reading column. It is useful for a short clip, portrait or document detail that should add texture without interrupting the article’s flow.",
      ],
      media: {
        type: "image",
        asset: {
          src: "/media/harbour-map.png",
          alt: "An abstract planning document with marked areas and routes.",
          caption:
            "A contained image can sit beside the text while remaining part of the prose rhythm.",
        },
      },
    },
    {
      type: "quote",
      text: "Scrutiny is not always loud. Sometimes it is the discipline of asking the same practical question until the answer is clear.",
      attribution: "Committee clerk",
    },
    {
      type: "text",
      heading: "What Remains on the Record",
      paragraphs: [
        "The record is not simply a transcript of what happened. It is a public trail of attention: what was noticed, what was challenged and what was left for departments to explain.",
      ],
    },
  ],
};

export default committeeRoomNotes;
