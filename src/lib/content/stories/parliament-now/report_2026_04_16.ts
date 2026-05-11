import type { Story } from "../../types";

export const report20260416: Story = {
  slug: "report-2026-04-16",
  section: "parliament-now",
  heroLayout: "contained",
  eyebrow: "Report | Joint Committee on Justice",
  title: "National Cyber Security Bill 2026",
  dek: "Pre-legislative scrutiny highlights the a need for a grace period following the implementation of the proposed legislation and increasing the guidance available to affected stakeholders.",
  byline: "Angharad Williams",
  date: "May 9, 2026",
  readingTime: "5 min read",
  hero: {
    src: "/media/report_launch.jpg",
    alt: "Members of the Joint Committee on Justice during a committee report launch in the AV room of Leinster House",
    //caption:
    //"Committee reports are often the clearest public record of how scrutiny work is translated into recommendations.",
  },
  blocks: [
    {
      type: "text",
      heading: "An oversight body must be given teeth",
      paragraphs: [
        "Cybersecurity threats are almost always cross-border, and a cyberattack on the critical facilities of one country can affect the EU as a whole. EU countries need to have strong government bodies that supervise cybersecurity in their country and that work together with their counterparts in other Member States by sharing information.",
        " This is particularly important for sectors that are critical for our societies. The oversight body must be given teeth, according to the Cathaoirleach, Deputy Matt Carthy.",
      ],
    },
    {
      type: "media-text",
      paragraphs: [
        "The main objectives and tasks of ENISA are laid down in the basic act, namely the Cybersecurity Act (CSA). ENISA provides support to Member States, EU institutions and businesses in key areas, including the implementation of the NIS Directive, Cyber Resilience Act and Cyber Solidarity Act.",
        "The Agency is also supporting the cybersecurity certification process of ICT products, ICT services and ICT processes, as established in Title III of the CSA.",
        "The Cybersecurity Act also established the European Cybersecurity Certification Framework (ECCF), which provides common cybersecurity requirements and evaluation criteria for certification of ICT products, ICT services and ICT processes. ",
      ],
      mediaSide: "left",
      media: {
        type: "video",
        asset: {
          src: "/media/Committee_launch.mp4",
          caption: "The Cathaoirleach introduces the report",
        },
      },
    },
    {
      type: "text",
      paragraphs: [
        "These include fragmentation between health and education supports, persistent workforce shortages, inconsistent access to communication and therapeutic services, delays in early intervention, and continued reliance on diagnosis as a gateway to support. These barriers contribute to reduced timetables, exclusion, school avoidance and unmet learning needs.",
      ],
    },
    {
      type: "image",
      layout: "inline",
      image: {
        src: "/media/committee-members-speak-at-a-report-launch.jpg",
        alt: "Deputy O Snodaigh makes a point at the launch of the justice committee report",
        caption:
          "Deputy Aengus Ó Snodaigh highlighted the need for regulatory simplification in order to make the process as efficient as possible.",
      },
    },
    {
      type: "text",
      paragraphs: [
        "Stakeholders across organisations, schools and professional bodies articulated a common theme: the need to move from a parallel, diagnosis-led system to a coordinated, needs-led approach with strong early intervention, multidisciplinary collaboration, and evidence based inclusive practice.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Find out more",
      //heading: "Follow the record",
      links: [
        {
          label: "Read the report",
          href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_justice_home_affairs_and_migration/reports/2026/2026-02-18_report-on-pre-legislative-scrutiny-of-the-general-scheme-of-the-national-cyber-security-bill-2024_en.pdf",
          description: "The complete report, including recommendations.",
        },
        {
          label: "Explore the committee",
          href: "https://www.oireachtas.ie/en/committees/34/justice-home-affairs-and-migration/",
          description:
            "View the committee page, including membership and debates.",
        },
      ],
    },
  ],
};

export default report20260416;
