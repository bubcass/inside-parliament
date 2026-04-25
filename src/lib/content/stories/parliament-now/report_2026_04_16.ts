import type { Story } from "../../types";

export const report20260416: Story = {
  slug: "report-2026-04-16",
  section: "parliament-now",
  heroLayout: "contained",
  eyebrow: "Report | Joint Committee on Justice",
  title: "National Cyber Security Bill 2026",
  dek: "Pre-legislative scrutiny highlights the a need for a grace period following the implementation of the proposed legislation and increasing the guidance available to affected stakeholders.",
  byline: "Stephen Higgins",
  date: "April 16, 2026",
  readingTime: "3 min read",
  hero: {
    src: "/media/report_launch.jpg",
    alt: "Members of the Joint Committee on Justice during a committee report launch in the AV room of Leinster House",
    //caption:
    //"Committee reports are often the clearest public record of how scrutiny work is translated into recommendations.",
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        "This is a lighter placeholder version of the report launch format, intended to give you a second ready-to-edit example alongside the April 23 story.",
        "It keeps the same editorial structure: a contained hero, a brief body section and a set of direct source links at the end.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Find out more",
      links: [
        {
          label: "Read the report",
          href: "https://www.oireachtas.ie/",
          description:
            "Open the published report and accompanying committee material.",
        },
        {
          label: "Explore the committee",
          href: "https://www.oireachtas.ie/en/committees/34/health/",
          description:
            "View membership, meetings and related committee business.",
        },
      ],
    },
  ],
};

export default report20260416;
