import type { Story } from "../../types";

export const theSeanadAtWork: Story = {
  slug: "the-seanad-at-work",
  section: "parliament-at-work",
  featured: true,
  heroLayout: "split",
  eyebrow: "The Seanad at Work",
  title: "Unwavering eye: European scrutiny in the Seanad",
  dek: "With its scrutiny of European measures, the Upper House plays a crucial role  nurturing Ireland's long-standing relationship with Europe. \nThe Cathaoirleach, Senator Mark Daly, sees this as vital work now more than ever.",
  byline: "Angharad Williams",
  date: "April 22, 2026",
  readingTime: "8 min read",
  hero: {
    src: "/media/cathaoirleach.png",
    alt: "The Cathaoirleach, Mark Daly, in the chair at the Seanad",
    caption: null,
    credit: null,
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        "On Tuesday the Seanad Select Committee on EU Scrutiny and Transparency will hold a discussion with the Minister of State at the Department of the Taoiseach with responsibility for EU affairs as it continues the development of its 2026 work programme.",
        "The work of this committee arises from a Cabinet decision from July 2022, after which the Minister of State, Deputy Byrne, said he looked forward to appearing before the new Seanad select committee to outline the principles of intended EU statutory instruments.",
      ],
    },
    {
      type: "image",
      layout: "wide",
      image: {
        src: "/media/seanad-wide.png",
        alt: "A wide view of the Seanad chamber during proceedings.",
        caption:
          "The Seanad's scrutiny work is often described as detailed, technical and less partisan than headline chamber exchanges.",
      },
    },
    {
      type: "text",
      heading: "A New Layer of Oversight",
      paragraphs: [
        'Deputy Byrne said the process would add greater transparency to the transposition of EU secondary legislation, which has the power to benefit areas such as the environment, consumer rights and employee rights.',
        "The role of the committee is to specifically examine EU directives and consider proposals for statutory instruments that would give effect to the contents of these directives in Irish law, a process known as transposing the directive.",
      ],
    },
    {
      type: "media-text",
      eyebrow: "Inside the chamber",
      heading: "Scrutiny is often quiet work",
      paragraphs: [
        "It begins the examination at an early stage, assessing the potential impact of directives on Ireland and tracking how EU directives and regulations progress from Brussels to implementation in national law.",
        "It may also consider the potential effects and consequences of failing to transpose the functions, and refer any draft statutory instrument to a relevant joint committee for further consideration.",
      ],
      mediaSide: "right",
      media: {
        type: "image",
        asset: {
          src: "/media/alice-mary.jpg",
          poster: "/media/alice-mary.jpg",
          caption:
            "Senator Alice-Mary Higgins is among the members who have contributed to debate on how the Seanad should scrutinise EU measures.",
        },
      },
    },
    {
      type: "text",
      heading: "The Scale of the Task",
      paragraphs: [
        "At the committee's meeting with Minister of State Thomas Byrne on 17 February 2026, members heard how much the workload has expanded. Byrne said the number of statutory instruments made by Ministers each year under the European Communities Act 1972 has grown from about 20 in the 1970s to roughly 200 a year in recent times.",
        "He estimated that about 70 draft EU-related statutory instruments a year may come before this committee, amounting to about 10% of all statutory instruments made by Government annually. Byrne also said the committee's amended terms of reference, adopted in August 2025, now extend beyond draft statutory instruments to include infringement proceedings and external EU agreements.",
      ],
    },
    {
      type: "video",
      video: {
        src: "/media/transparency_seanad.mp4",
        poster: "/media/full_chamber.jpg",
        caption:
          "The committee meets in the Seanad chamber and is distinctive in being made up entirely of Senators.",
      },
    },
    {
      type: "text",
      heading: "Established in 2025",
      paragraphs: [
        "This Seanad select committee was established in December 2025 and, at its inaugural meeting, the Cathaoirleach, Senator Mark Daly, noted the importance of its role.",
        'He said: "The legislation we deal with in the Dáil and Seanad every year is a drop in the ocean compared with the legislation done by Departments without scrutiny. Our role is to highlight it and change that system, which has been in place for half a century."',
        "Daly has also linked scrutiny directly to transparency and cost. In the committee's first meeting in December 2025 he argued that large volumes of EU-derived law can be finalised by Departments and signed by Ministers without elected members seeing the final text in advance, and pointed to a €1.54 million fine incurred over the late transposition of the work-life balance directive as an example of the price of delay.",
        "By February 2026, the committee was pressing Departments to give it draft statutory instruments and information notes at least six months before transposition deadlines. Byrne said a new transparency initiative would also see up-to-date details of EU directives due for transposition, and infringement cases against Ireland, published online as Ireland prepares for its Presidency of the Council of the European Union beginning on 1 July 2026.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      links: [
        {
          label: "Committee page",
          href: "https://www.oireachtas.ie/en/committees/34/seanad-select-committee-on-eu-scrutiny-and-transparency/",
          description: "Seanad Select Committee on EU Scrutiny and Transparency",
        },
        {
          label: "Read the 17 February 2026 debate",
          href: "https://data.oireachtas.ie/ie/oireachtas/debateRecord/seanad_select_committee_on_eu_scrutiny_and_transparency/2026-02-17/debate/mul%40/main.pdf",
          description: "Official Report of the committee's engagement with Minister of State Thomas Byrne",
        },
        {
          label: "Read the Minister's opening statement",
          href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/seanad_select_committee_on_eu_scrutiny_and_transparency/submissions/2026/2026-02-17_opening-statement-thomas-byrne-t-d-minister-of-state-for-european-affairs-department-of-the-taoiseach-department-of-foreign-affairs-and-trade_en.pdf",
          description: "Opening statement by Thomas Byrne TD, 17 February 2026",
        },
        {
          label: "Read the inaugural committee debate",
          href: "https://data.oireachtas.ie/ie/oireachtas/debateRecord/seanad_select_committee_on_eu_scrutiny_and_transparency/2025-12-17/debate/mul%40/main.pdf",
          description: "Official Report of the committee's first meeting in December 2025",
        },
        {
          label: "Background on the Seanad's EU scrutiny role",
          href: "https://www.oireachtas.ie/en/visit-and-learn/centenaries/seanad100/the-seanad-looking-forward/",
          description: "Seanad100 page on reform and scrutiny of EU legislation",
        },
      ],
    },
  ],
};

export default theSeanadAtWork;
