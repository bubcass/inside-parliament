import type { Story } from "../../types";

export const thisWeekInTheChamber: Story = {
  slug: "this-week-dail-eireann",
  section: "parliament-now",
  heroLayout: "contained",
  eyebrow: "The week ahead | 28-30 April",
  title: "Dáil Éireann",
  dek: "Report Stage of the Social Welfare Bill will take place on Tuesday. Private Members' time will see a Labour Party motion on the agriculture sector and a Sinn Féin Bill proposing financial assistance for home carers.",
  byline: "David Cass",
  date: "April 22, 2026",
  readingTime: "2 min read",
  hero: {
    src: "/media/deputy_bacik.jpg",
    alt: "Deputy Ivana Bacik speaks in the Dáil Chamber",
  },
  blocks: [
    {
      type: "text",
      heading: "Government business",
      paragraphs: [
        "Government business  on Tuesday will be Report Stage of the <strong>Social Welfare Bill 2026</strong>. There are more than 30 proposed amendments to the legislation to be dealt with.",
        "On Wednesday there will be <strong>statements on fuel prices</strong> and the regular <strong>discussion of European Council priorities</strong> before the Taoiseach attends a summit in Copenhagen on Friday.",
        "Questions this week will be directed to the Minister for Finance on Wednesday morning and the Minister for Defence on Thursday.",
      ],
    },
    {
      type: "media-text",
      //eyebrow: "Private Members' time",
      heading: "Private Member's time",
      paragraphs: [
        "The Labour Party's motion on <strong>supports for the agriculture sector</strong> will be debated on Wednesday morning.",
        "The motion calls for tax reliefs for certain agricultural services and the extension of low-cost loans where needed.",
        "Second Stage of the <strong>Home Carers (Taxation of Income) Bill 2026</strong>, proposed by Sinn Féin's Deputy Pearse Doherty, will taken place on Thursday evening.",
        "The Bill proposes the exclusion of certain earnings by home carers from the tax net and the extension of certain income disregards for full and part-time carers.",
      ],
      media: {
        type: "video",
        asset: {
          src: "/media/Socials_tease-2.mp4",
          poster: "/media/full_chamber.jpg",
          caption:
            "A round-up of what's expected to be discussed this week in Dáil Éireann",
        },
      },
    },
    {
      type: "text",
      heading: "Other business",
      paragraphs: [
        "Legislation dealing with an inquiry into the Omagh bombing will be discussed on Wednesday. Second Stage of the Mental Health Bill 2026 continues on Thursday and motion on the voting rights of persons in presidential elections is also scheduled to be discussed.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      links: [
        {
          label: "Schedule of Dáil business",
          href: "https://www.oireachtas.ie/en/dail-schedule-display-view/",
          description: "The detailed schedule for the week ahead",
        },
        {
          label: "Dáil Éireann video on demand",
          href: "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/?house=dail",
          description:
            "Watch recent and archived video on demand from Dáil sittings",
        },
      ],
    },
  ],
};

export default thisWeekInTheChamber;
