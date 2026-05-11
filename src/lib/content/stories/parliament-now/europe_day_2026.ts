import type { Story } from "../../types";

export const parliamentNowStoryScaffold: Story = {
  slug: "europe-day-2026-2026-05-11",
  section: "parliament-now",
  heroLayout: "split",
  eyebrow: "Europe Day 2026",
  title: "Turning history's wounds into shared strengths",
  dek: "The European project grew from the kernel of the Schuman Declaration in 1950, a rejection of conflict and the impetus for a better future built on the fundamental principle of co-operation.",
  byline: "Angharad Williams",
  date: "May 11, 2026",
  readingTime: "6 min read",
  hero: {
    src: "/media/european-flag.mp4",
    alt: "The European flag flying in the sunshine",
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        "On 9 May every year EU member states celebrate <strong>Europe Day</strong>.",
        "On the anniversary of the signing of the Schuman declaration in 1950, this is a day of reflection on the co-operation, prosperity and peace that has come about through the European project.",
        "This year is the 40th anniversary of the Europe Day commemorations, which first began in 1986. That first celebration of Europe Day also coincided with the first public use of the EU flag and anthem.",
      ],
    },
    {
      type: "media-text",
      heading: "Ireland takes a leading role",
      paragraphs: [
        "In 2026, Ireland will also host the Presidency of the Council of the European Union for an eighth time. Ireland first joined the European Economic Community in 1973 and first held the Presidency in 1975.",
        "Dr. Garrett FitzGerald, a former Taoiseach, has said that the success of this first Irish Presidency helped develop our our country's credentials as a serious European player.",
        "From July 2026, the Irish Presidency will focus on greater co-operation on moving towards a peace across Europe and the global stage, economic innovation and efforts to end poverty.",
      ],
      mediaSide: "right",
      media: {
        type: "video",
        asset: {
          src: "/media/ceann-comhairle-europe-day.mp4",
          poster: "/media/ceann_comhairle_chair.jpg",
          caption:
            "The Ceann Comhairle speaks about the importance of the European project in a time of uncertainty.",
        },
      },
    },
    {
      type: "text",
      heading: "The role of the Oireachtas",
      paragraphs: [
        "Senators in the Upper House of the Oireachtas play a crucial role in debating legislation proposed by the Government and initiating Bills in their own right. The Seanad also has a unique role to play in nurturing Ireland’s long-standing relationship with Europe with scrutiny of European directives and with its regular interaction with Members of the European Parliament.",
      ],
    },
    {
      type: "media-text",
      paragraphs: [
        "According to the Cathaoirleach, Senator Mark Daly, the Seanad's scrutiny of European measures is vital work now more than ever.",
        "<div style=\"border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0.5rem; line-height: 1.5;\"><p>We are a critical juncture now in our relationship with Europe. I've spoken before about John Hume's idea that the answer to difference is to respect it. That's what the Schuman Declaration did. It's what we must continue to do.</p></div>",
        "To this end, the work of the Seanad scrutiny committee is complemented by regular discussions with Ireland's MEPs, who are asked to come to the Upper House to foster the connection between people and their European representatives, ensure accountability on a national platform and facilitate collaboration between Senators and MEPs. ",
      ],
      mediaSide: "left",
      media: {
        type: "video",
        asset: {
          src: "/media/Cathaoirleach_Europe_Day.mp4",
          poster: "/media/cathaoirleach-europe-day.jpg",
          autoplay: true,
          caption:
            "The Cathaoirleach echoes John Hume in noting that differences must be respected if co-operation is to succeed",
        },
      },
    },
    {
      type: "text",
      heading: "Benefits of co-operation",
      paragraphs: [
        "The benefits arising from membership of the European Union have not just been confined to societal and political advances. Being part of a wider trading bloc has allowed countries like Ireland to benefit economically in ways that would have been difficult or impossible otherwise.",
      ],
    },
    {
      type: "flourish",
      embedType: "chart",
      dataSrc: "story/3664032?657582",
      thumbnail: "https://public.flourish.studio/story/3664032/thumbnail",
      alt: "Flourish visualisation",
      caption:
        "The economic benefits to Ireland from co-operation with the European Union",
    },
    {
      type: "text",
      heading: "Get involved with Europe Day",
      paragraphs: [
        "Europe Day is a chance to recognise our shared values and to celebrate the community we represent and are jointly working to protect and nourish. This special occasion is also an opportunity to connect with citizens and to showcase how the EU is working to protect and create opportunities for people and promote partnerships globally.",
        "Tens of thousands of visitors take part in the events and activities to celebrate Europe Day every year, visting EU institutions in Brussels, Strasbourg, Luxembourg and Frankfurt to find out more about the work and policies that shape our life.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      links: [
        {
          label: "Europe Day",
          href: "https://european-union.europa.eu/principles-countries-history/europe-day_en",
          description:
            "Find out how Europe Day is celebrated across the Continent",
        },
        {
          label: "How Europe Day is commemorated in Parliament",
          href: "https://www.oireachtas.ie/en/inter-parliamentary-work/european-union/europe-day//",
          description: "Europe Day in the Houses of the Oireachtas",
        },
      ],
    },
  ],
};

export default parliamentNowStoryScaffold;
