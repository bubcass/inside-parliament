import type { Story } from "../../types";

export const routesThroughTheBuilding: Story = {
  slug: "leaders-questions",
  section: "parliament-at-work",
  heroLayout: "immersive",
  eyebrow: "The Dáil at work",
  title: "To the point: Accountability and Leaders' Questions",
  dek: "So many hours of debate in the Dáil are often reduced to a few key questions and answers but the process is fundamental to our parliamentary democracy.\nThe Ceann Comhairle, Deputy Verona Murphy, gives us insight into the weekly Leader's Questions slot in the Dáil.",
  byline: "David Cass",
  date: "April 14, 2026",
  readingTime: "6 min read",
  hero: {
    src: "/media/ceann_comhairle_in_chair.jpg",
    alt: "The Ceann Comhairle, Deputy Verona Murphy, seated in the Seanad chamber.",
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        "So many hours of debate in the Dáil can be reduced to a few key questions and answers but the process is fundamental to our parliamentary democracy.",
        "The Ceann Comhairle, Deputy Verona Murphy, gives us insight into the weekly Leader's Questions slot in the Dáil.",
      ],
    },
    {
      type: "image",
      layout: "wide",
      image: {
        src: "/media/seanad-wide.png",
        alt: "A wide editorial image of the Seanad chamber.",
        caption:
          "Wide media remains available when the story needs a stronger visual pause.",
      },
    },
    {
      type: "scrolly",
      title: "A Sitting Day in Three Movements",
      intro:
        "The standard scrolly block is useful when steps need adjacent explanatory text rather than immersive overlay treatment.",
      steps: [
        {
          eyebrow: "Morning",
          title: "Briefings set the agenda",
          body: "Members begin with notes, correspondence and department material before the public sitting begins.",
          image: {
            src: "/media/scrolly-quay.png",
            alt: "Abstract editorial image representing morning preparation.",
          },
        },
        {
          eyebrow: "Afternoon",
          title: "Questions move into public view",
          body: "The chamber gives procedural shape to questions that may have been developing for days.",
          image: {
            src: "/media/scrolly-lane.png",
            alt: "Abstract editorial image representing movement through a chamber.",
          },
        },
        {
          eyebrow: "Evening",
          title: "The record carries the work forward",
          body: "After the sitting, the written record becomes the place where scrutiny can be followed and returned to.",
          image: {
            src: "/media/scrolly-marsh.png",
            alt: "Abstract editorial image representing the public record.",
          },
        },
      ],
    },
  ],
};

export default routesThroughTheBuilding;
