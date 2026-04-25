import type { Story } from "../../types";

export const thisWeekInTheChamber: Story = {
  slug: "this-week-dail-eireann",
  section: "parliament-now",
  heroLayout: "contained",
  eyebrow: "The week ahead",
  title: "Dáil Éireann",
  dek: "Report Stage of the Social Welfare Bill will take place on Tuesday and Wednesday this week. Private Members' time will see debates on the agriculture sector and financial assistance for home carers.",
  byline: "David Cass",
  date: "April 22, 2026",
  readingTime: "4 min read",
  hero: {
    src: "/media/deputy_bacik.jpg",
    alt: "A wide view of the Dáil Chamber with the Taoiseach speaking during parliamentary business.",
  },
  blocks: [
    {
      type: "text",
      heading: "What to Watch",
      paragraphs: [
        "The week’s parliamentary business often moves across several registers at once: chamber debate, committee scrutiny, written questions and the quieter work of preparing amendments or reports.",
        "This update format is intended for stories that need to feel immediate without becoming a live blog. It gives editors room to explain what is happening now and why it matters.",
      ],
    },
    {
      type: "media-text",
      eyebrow: "Current business",
      heading: "A compact update with context",
      paragraphs: [
        "A contained media block can carry a short clip or still image beside the essential context, keeping the piece sharp while preserving the editorial reading flow.",
      ],
      media: {
        type: "video",
        asset: {
          src: "/media/transparency_seanad.mp4",
          poster: "/media/full_chamber.jpg",
          caption:
            "Current-feeling pieces can use short ambient motion without requiring a full-width video chapter.",
        },
      },
    },
    {
      type: "quote",
      text: "The useful question for readers is simple: what is moving this week, and what should I understand before it moves further?",
      attribution: "Inside Parliament editorial note",
    },
    {
      type: "text",
      heading: "What Happens Next",
      paragraphs: [
        "The next stage may be a vote, a committee session, a report or a return to departmental correspondence. The update should leave readers with enough structure to follow that next step when it arrives.",
      ],
    },
  ],
};

export default thisWeekInTheChamber;
