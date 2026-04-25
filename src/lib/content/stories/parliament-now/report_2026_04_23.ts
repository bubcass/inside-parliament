import type { Story } from "../../types";

export const thePublicRecord: Story = {
  slug: "health-report-23-April",
  section: "parliament-now",
  featured: true,
  heroLayout: "contained",
  eyebrow: "Report | Joint Committee on Health",
  title: "Oversight of children in care",
  dek: "The report indicates serious failings in accountability being provided for certain sectors of children's care. The <em>guardian ad litem</em> system also came under scrutiny.",
  byline: "Robert Kennedy-Cochrane",
  date: "April 23, 2026",
  readingTime: "4 min read",
  hero: {
    src: "/media/report-launch-alan-kelly.jpg",
    alt: "Members of the Joint Committee on Health launching a report on the Plinth at Leinster House in April 2026",
  },
  blocks: [
    {
      type: "text",
      heading: "An inability to provide oversight",
      paragraphs: [
        "Witnesses from multiple parts of the children in care sector raised concerns about 'an inability to provide oversight in the care of children and particularly the lack of accountability for care providers', according to the Cathaoirleach, Deputy Alan Kelly.",
        "He also indicated that key actors seemed to abscond from their responsibilities because of human resource constraints.",
        "The report calls for a targeted reform of management in key oversight areas and argues that the reform should be carried out urgently.",
      ],
    },
    {
      type: "media-text",
      paragraphs: [
        "The Committee acknowledges the significant progress made in recent years to improve access to education for disabled learners, including expanded special education provision, enhanced investment in supports and emerging reforms to early intervention and therapeutic services. ",
        "However, the Committee heard that systemic features of the current framework prevent Ireland from fully realising its obligations under Article 24 of the UNCRPD.",
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
        src: "/media/report_launch-childrens-health.jpg",
        alt: "A close editorial image of a marked document.",
        caption:
          "Deputy Gary Ringrose and Deputy Brian O'Driscoll, members of the Joint Committee on Health",
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
          href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_health/reports/2026/2026-04-15_report-on-dental-services-in-the-healthcare-system_en.pdf",
          description: "The complete report, including recommendations.",
        },
        {
          label: "Explore the committee",
          href: "https://www.oireachtas.ie/en/committees/34/health/",
          description:
            "View the committee page, including membership and debates.",
        },
      ],
    },
  ],
};

export default thePublicRecord;
