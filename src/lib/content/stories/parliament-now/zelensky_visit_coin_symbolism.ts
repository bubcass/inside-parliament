import type { Story } from "../../types";

export const zelenskyVisitCoinSymbolism: Story = {
  slug: "during-president-zelenskyys-visit-the-rich-symbolism-of-an-irish-coin",
  section: "parliament-now",
  heroLayout: "split",
  eyebrow: "Presidential visit",
  title:
    "During President Zelenskyy's visit, the rich symbolism of an Irish coin",
  dek: "In appreciation for his address to a sitting of both Houses of the Oireachtas, H.E. President Volodymyr Zelenskyy of Ukraine was presented with a token rich in symbolism by the Ceann Comhairle and the Cathaoirleach.",
  byline: "David Cass",
  date: "April 22, 2026",
  readingTime: "3 min read",
  hero: {
    src: "/media/coin.mp4",
    alt: "President Volodymyr Zelenskyy during his visit to the Houses of the Oireachtas",
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        'President Zelenskyy received a silver coin cast from an original Irish <em>Leath reul</em>, threepence, from 1928, featuring the Irish hare, an animal associated with luck in times of change. The Irish harp features on the obverse, with the text "Saorstát Éireann, Irish Free State".',
        "In introducing President Zelenskyy's address, the Ceann Comhairle, Deputy Verona Murphy, alluded to the shared experience of both Ireland and Ukraine:",
        '<div style="border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0.5rem; line-height: 1.5;"><p>Ireland\'s journey to peace was long and arduous, but it succeeded because people persevered in the belief that peace is the only solution. The same possibility exists for Ukraine.</p></div>',
      ],
    },
    {
      type: "media-text",
      //eyebrow: "Inside the chamber",
      //heading: "Scrutiny is often quiet work",
      paragraphs: [
        "The Cathaoirleach, Senator Mark Daly, also referenced the difficult experiences of both countries: ",
        '<div style="border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0.5rem; line-height: 1.5;"><p>We on this island have known violence and struggle, a violence that devastated our communities, but we now know peace. Ireland and Europe have stood with and will continue to stand with Ukraine, and we hope Ukraine finds a just peace in the near future.</p></div>',
        "After the Irish Free State was established in 1922, the Coinage Act 1926 empowered the Government to create a new currency to replace the British coins then in circulation. ",
      ],
      mediaSide: "right",
      media: {
        type: "image",
        asset: {
          src: "/media/zelenskyy.jpg",
          poster: "/media/zelenskyy.jpg",
          caption:
            "President Zelenskyy spoke of the importance of Ireland's voice in global matters",
        },
      },
    },
    {
      type: "text",
      paragraphs: [
        'This was an important step in the creation of the uniquely Irish identity of the new State. In 1913, Pádraig Pearse had characterised the British coins in people’s pockets as symbols of "the foreign tyranny that holds us. A good Irishman should blush every time he sees a penny."',
        'Ukraine has recently <a title=\"Ukraine to rename its coins\" rel=\"noopener noreferrer\" href=\"https://www.reuters.com/business/ukraine-rename-kopeck-coin-another-break-with-russia-2025-11-05/\" target=\"_blank\"> announced its own plans to rename its kopikya coins</a>, also known by their Soviet name of kopeck, to the historical Ukrainian term "shah".',
      ],
    },
    {
      type: "image",
      layout: "wide",
      image: {
        src: "/media/Office-holders-in-the-Oireachtas-with-President-Zelenskyy-and-Olena-Zelenska.jpg",
        alt: "Office holders in the Oireachtas with President Zelenskyy and Olena Zelenska",
        caption:
          "President Zelenskyy and Olena Zelenska met the office holders in the Oireachtas before his historic speech",
      },
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      //heading: "Related links",
      links: [
        {
          label: "Read the address",
          href: "https://www.oireachtas.ie/en/debates/debate/dail/2025-12-02/3/",
          description:
            "Official Report of Address by H.E. Volodymyr Zelenskyy, President of Ukraine",
        },
        {
          label: "Watch the address",
          href: "https://video.oireachtas.ie/dail/34/2025-12-02/address-by-the-president-of-ukraine-h-e-volodymyr-oleksandrovych-zelenskyy-to-both-houses-of-the-oireachtas_1538/video.mp4",
          description: "Video on demand",
        },
        {
          label: "Official photos of the event",
          href: "https://www.flickr.com/photos/oireachtas/albums/72177720330662830/",
          description: "Flickr album of official photos",
        },
      ],
    },
  ],
};

export default zelenskyVisitCoinSymbolism;
