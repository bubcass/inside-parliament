import type { Story } from "../../types";

export const europeanMeasuresExplained: Story = {
  slug: "how-is-the-ceann-comhairle-elected",
  section: "parliament-explained",
  heroLayout: "immersive",
  eyebrow: "Learning Hub",
  title: "How is the Ceann Comhairle elected?",
  dek: "The election of the Ceann Comhairle is the first business conducted by a newly elected Dáil.\nSince 2016, the process has been a secret ballot of Members.",
  byline: "Angharad Williams",
  date: "April 14, 2026",
  readingTime: "5 min read",
  hero: {
    src: "/media/dail_no_sit_2.jpg",
    alt: "The bell in the Dáil Chamber",
  },
  blocks: [
    {
      type: "text",
      //heading: "Selecting the Ceann Comhairle",
      paragraphs: [
        "The Ceann Comhairle is the chairperson of Dáil Éireann and presides impartially and with authority over the business and proceedings of the House.",
        "When a new Dáil meets and after the roll of elected Members has been announced by the Clerk of the Dáil, the process to select the new Ceann Comhairle begins.",
        "Our <strong>visual essay</strong> explains the process of how a Member of the newly elected Dáil becomes the Ceann Comhairle.",
      ],
    },
    {
      type: "scene-scrolly",
      //title: "Making their case",
      //intro: "This first sequence follows the movement from nomination to count inside Leinster House.",
      steps: [
        {
          //eyebrow: "Step 1",
          title: "Nomination of candidates",
          body: "To begin the process the Clerk of the Dáil announces the names of Members who have a valid nomination for selection. Candidates need to be nominated by at least seven members of Dáil Éireann, who must have signed the Roll of Members. Each Member is allowed to nominate only one candidate.",
          placeLabel: "Dáil Chamber",
          overlayPosition: "left-center",
          focus: { x: 52, y: 38, scale: 1.02 },
          image: {
            src: "/media/clerk-addressing-dail.jpg",
            alt: "John McGuinness speaking in the Dáil during the election of the Ceann Comhairle.",
          },
        },
        {
          // eyebrow: "Step 4",
          title: "Candidates address the House",
          body: "Before proceeding to the ballot, each nominated Member may speak on their own behalf or have someone speak on their behalf.",
          placeLabel: "Dáil Chamber",
          overlayPosition: "right-center",
          focus: { x: 52, y: 42, scale: 1.02 },
          image: {
            src: "/media/Verona-murphy-speaking-in-the-Dail.jpg",
            alt: "Verona Murphy speaking in the Dáil before the selection of the Ceann Comhairle.",
          },
        },
        {
          //eyebrow: "Step 3",
          title: "Ballot boxes leave the Chamber",
          body: "The ballots are cast in secret. Once the voting has finished, the ballot boxes are carried by parliamentary ushers to a room where the votes are counted by Oireachtas officials.",
          placeLabel: "Leinster House corridor",
          overlayPosition: "left-center",
          focus: { x: 49, y: 44, scale: 1.03 },
          image: {
            src: "/media/ushers-exiting-the-dail-chamber-with-ballot-boxes.jpg",
            alt: "Ushers carrying ballot boxes out of the Dáil chamber during the election process.",
          },
        },
        {
          //eyebrow: "Step 2",
          title: "Officials prepare the count",
          body: "The ballots are sorted by officials and then the count begins. The count happens in view of the candidates.",
          placeLabel: "Seanad Antechamber",
          overlayPosition: "right-center",
          focus: { x: 50, y: 46, scale: 1.01 },
          image: {
            src: "/media/counting-of-ceann-comhairle-ballots.jpg",
            alt: "Officials and staff overseeing the counting of ballots in a reception room in Leinster House.",
          },
        },
      ],
    },
    {
      type: "text",
      paragraphs: [
        "If there is more than one candidate, the Ceann Comhairle is selected using <strong>proportional representation with a single transferable vote</strong>, the same system used in the general election to the Dáil.",
        "If no candidate reaches the quota on first preferences, the individual with the fewest votes is eliminated and the votes are redistributed in accordance with their next highest preference. Eliminations and redistributions continue until one nominee reaches the quota or is the only remaining candidate.",
      ],
    },
    {
      type: "chart",
      chart: "ceann-comhairle-waffle",
      data: "/data/CCSelectionCompleteData.csv",
      title: "Explore the election process",
      //caption:
      //"Standings after each count. Candidates must reach the quota to be elected.",
    },
    {
      type: "text",
      paragraphs: [
        "The successful candidate must be formally elected by the Dáil before taking the Chair of the Dáil.",
      ],
    },
    {
      type: "scene-scrolly",
      steps: [
        {
          title: "The conclusion of the count",
          body: "Officials and supporters may observe the count proceedings. There may be several counts but once a candidate reaches the quota or is the final remaining candidate, the result is announced in the count room by the Clerk of the Dáil.",
          placeLabel: "Seanad Antechamber",
          overlayPosition: "right-center",
          focus: { x: 46, y: 44, scale: 1.02 },
          image: {
            src: "/media/announcement-of-ceann-comhairle-vote-result.jpg",
            alt: "Verona Murphy seated with supporters and officials nearby as the result of the Ceann Comhairle count is awaited.",
          },
        },
        {
          title: "Putting the question",
          body: "Although the successful candidate is known at the conclusion of the count, the question must be put to the Dáil in order to be confirmed. The candidates return to the Dáil for the question to be put by the Clerk of the Dáil. ",
          placeLabel: "Dáil Chamber",
          overlayPosition: "right-lower",
          focus: { x: 51, y: 39, scale: 1.02 },
          image: {
            src: "/media/ceann_comhairle_election.jpg",
            alt: "Verona Murphy being escorted through the Dáil chamber after being elected Ceann Comhairle as Members applaud.",
          },
        },
        {
          title: "The Ceann Comhairle takes the oath of office",
          body: "After the question is put the new Ceann Comhairle takes the oath of office and is robed. After taking his or her seat, the business of Dáil Éireann can continue with its new chairperson in place.",
          placeLabel: "Dáil Chamber",
          overlayPosition: "left-center",
          focus: { x: 46, y: 42, scale: 1.02 },
          image: {
            src: "/media/ceann_comhairle_in_chair.jpg",
            alt: "The newly elected Ceann Comhairle addressing the Dáil from the Chair after the formal election.",
          },
        },
      ],
    },
    {
      type: "quote",
      text: "I do solemnly declare that I will duly and faithfully and to the best of my knowledge and ability execute the office of Ceann Comhairle of Dáil Éireann without fear or favour, apply the rules as laid down by this House in an impartial and fair manner, and maintain order and uphold the rights and privileges of Members in accordance with the Constitution and the Standing Orders of Dáil Éireann.",
      attribution: "Oath taken by the Ceann Comhairle upon election",
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      links: [
        {
          label: "Role of the Ceann Comhairle",
          href: "https://www.oireachtas.ie/en/members/office-holders/ceann-comhairle/#CCRole",
          description:
            "Find out more abou the role and responsibilities of the Ceann Comhairle",
        },
        {
          label: "Read the debate",
          href: "https://www.oireachtas.ie/en/debates/debate/dail/2024-12-18/7/",
          description:
            "Official Report of the election of Deputy Verona Murphy as Ceann Comhairle.",
        },
        {
          label: "Find out about previous officeholders",
          href: "https://www.oireachtas.ie/en/members/office-holders/former-office-holders/",
          description: "Previous Cinn Comhairle",
        },
      ],
    },
  ],
};

export default europeanMeasuresExplained;
