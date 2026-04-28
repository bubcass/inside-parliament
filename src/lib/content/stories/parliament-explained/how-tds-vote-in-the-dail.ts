import type { Story } from "../../types";

export const howDoTDsVoteInTheDail: Story = {
  slug: "how-do-tds-vote-in-the-dail",
  section: "parliament-explained",
  featured: true,
  heroLayout: "immersive",
  eyebrow: "Parliament Essentials",
  title: "How do TDs vote in the Dáil?",
  dek: "One of the most fundamental parts of a TDs job is to vote on business brought before the Dáil.\nThis voting process means each Deputy is accountable for the decisions they make on behalf of their constituents.",
  byline: "David Cass",
  date: "April 23, 2026",
  readingTime: "5 min read",
  hero: {
    src: "/media/full_chamber.png",
    alt: "A wide view of the Seanad chamber prepared for parliamentary business.",
  },
  blocks: [
    {
      type: "text",
      paragraphs: [
        "Dáil Éireann decides all questions put to it by the Chair. A question on an item of business, such as the business being conducted on a day or whether a piece of legislation is acceptable, is put at the end of a debate or a section of debate.",
        "If there is no disagreement the Chair may agree the question informally, or by <strong>voice vote</strong>. Where there is disagreement, Members may ask for a formal vote, which is formally called a <strong>division</strong>",
        "Explore how voting works in the Dáil with our <strong>visual essay</strong>.",
      ],
    },
    {
      type: "scene-scrolly",
      steps: [
        {
          title: "Debating in the Dáil",
          body: "The daily schedule in Dáil Éireann may contain a variety of business types, including legislation and motions. Some of these, including the process for creating laws, require the agreement of the House either during or at the end of the discussion.",
          //placeLabel: "Dáil Chamber",
          overlayPosition: "left-center",
          focus: { x: 50, y: 42, scale: 1.02 },
          image: {
            src: "/media/taoiseach_in_dail.jpg",
            alt: "A wide view of the chamber prepared for parliamentary business.",
          },
        },
        {
          title: "Getting the agreement of the House",
          body: "In many cases this agreement is given without a formal vote. Where agreement is not reached, however, Deputies may ask for a formal vote, or division of the Dáil, to take place.",
          //placeLabel: "Division lobbies",
          overlayPosition: "left-center",
          focus: { x: 50, y: 50, scale: 1.02 },
          image: {
            src: "/media/deputy_bacik.jpg",
            alt: "Deputy Ivana Bacik speaking in Dáil Éireann",
          },
        },
        {
          title: "Vótáil",
          body: 'The Ceann Comhairle, Leas-Cheann Comhairle or Acting Chairperson will put the question formally and Deputies asking for a formal vote will say "Vótáil".',
          //placeLabel: "Dáil Chamber",
          overlayPosition: "left-center",
          focus: { x: 50, y: 45, scale: 1.03 },
          image: {
            src: "/media/ceann_comhairle_in_dail.jpg",
            alt: "A division or vote is called in the Dáil Chamber.",
          },
          video: {
            src: "/media/division-called.mp4",
            poster: "/media/ceann_comhairle_in_dail.jpg",
          },
        },
      ],
    },
    {
      type: "text",
      paragraphs: [
        "Once the question has been put by the Chair, the vote process in the Chamber begins with the ringing of bells around Leinster House for a defined period. This is to allow Members who are not present in the Chamber the time to make their way to the Dáil for the formal vote.",
        "Once the defined period elapses, the doors to the Chamber are locked.",
      ],
    },
    {
      type: "vote-map",
      title: "How a vote looks in the Chamber",
      intro:
        "Explore the example of TDs voting on a motion before the House.  Once a vote begins, only Members of Dáil Éireann, parliamentary ushers and some Oireachtas officials are allowed in the Chamber for the vote.",
      chamberSvg: "/media/dail-chamber.svg",
      voteData: "/data/dail-vote-sample.json",
      seatData: "/data/seatAssignmentsHistory.csv",
      membersData: "/data/dail-members.json",
    },
    {
      type: "text",
      paragraphs: [
        "Members are assigned seats in the Dáil Chamber and must use them when voting in order to correctly identify their votes in the electronic process.",
        "A TD's vote is recorded when they push a green <strong>Tá</strong> (Yes), red <strong>Níl</strong> (No) or <strong>Staon</strong> (Abstain) button on the voting devide on at their seats. This button press is shown on the large public screens in the Dáil Chamber.",
      ],
    },
    {
      type: "scene-scrolly",
      steps: [
        {
          title: "The question is formally put",
          body: "When the doors have been locked the Chair will again inform the House of the question to be voted on and the process proceeds with TDs pushing a vote to indicate a vote of Tá (Yes), Níl (No) or Staon (Abstain).",
          //placeLabel: "Dáil Chamber",
          overlayPosition: "right-center",
          focus: { x: 50, y: 42, scale: 1.02 },
          image: {
            src: "/media/ceann_comhairle_in_the_chair.jpg",
            alt: "The Ceann Comhairle puts a question formally to the Dáil",
          },
          video: {
            src: "/media/division-in-dail.mp4",
            poster: "/media/ceann_comhairle_in_the_chair.jpg",
          },
        },
        {
          title: "The Members vote",
          body: "Most of the votes in the Dáil are taken electronically, meaning that when buttons are pressed at a TD's designated seat the results can be seen in real time on the large publicly visible screens.",
          //placeLabel: "Chamber floor",
          overlayPosition: "left-center",
          focus: { x: 50, y: 44, scale: 1.02 },
          image: {
            src: "/media/full_chamber.jpg",
            alt: "A voting process in the Dáil Chamber",
          },
          video: {
            src: "/media/dail-vote-screen.mp4",
            poster: "/media/full_chamber.jpg",
          },
        },
        {
          title: "Announcement of the vote results",
          body: "When the time for voting expires, the results are given to designated TDs called tellers, who sign the results and present them to the Chair.",
          //placeLabel: "Dáil Chamber",
          overlayPosition: "right-center",
          focus: { x: 50, y: 46, scale: 1.03 },
          image: {
            src: "/media/ceann_comhairle_in_the_chair.jpg",
            alt: "The Chair in the Dáil Chamber during parliamentary proceedings.",
          },
        },
      ],
    },
    {
      type: "text",
      heading: "Manual votes",
      paragraphs: [
        "The declaration of the vote result by the Chair is usually the end of the voting process. However, under certain circumstances Members may ask for a vote to be taken by manual means.",
        "Manual votes, or <strong>voting by other than electronic means</strong>, are also taken for certain votes, such as confidence in a Government or Minister. They may also occur in certain designated and specific cases if Members are dissatisfied with the outcome of the electronic voting process, or where the electronic vote process cannot take place because of technical reasons.",
        "Manual votes are taken by roll call, where the Clerk calls out the name of each Member in order and the TD responds by indicating the vote.",
      ],
    },
    {
      type: "link-list",
      eyebrow: "Explore further",
      links: [
        {
          label: "The voting process",
          href: "https://www.oireachtas.ie/en/procedure-guide-dail/voting/voting-overview",
          description: "An explanation of how voting works in the Dáil",
        },
        {
          label: "Vote Explorer | Dáil Éireann",
          href: "https://bubcass.github.io/chamber-vote-poc/?699",
          description: "Explore recorded votes in Dáil Éireann",
        },
      ],
    },
  ],
};

export default howDoTDsVoteInTheDail;
