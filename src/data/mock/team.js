/**
 * team.js
 * Mock team store — swap for a real teams API. `null` represents
 * "no team yet" and drives the create/join screen in
 * pages/student/StudentTeamPage.jsx.
 */
export const MOCK_TEAM = {
  id: "TEAM-9X4B2K",
  name: "Web Weavers",
  event: "CodeStorm — Hackathon Finals",
  joinCode: "9X4B2K",
  members: [
    {
      id: 1,
      name: "Aarav Mehta",
      role: "Leader",
      status: "confirmed",
      email: "aarav.mehta@example.edu",
    },
    {
      id: 2,
      name: "Ishita Rao",
      role: "Member",
      status: "confirmed",
      email: "ishita.rao@example.edu",
    },
    {
      id: 3,
      name: "Devansh Patel",
      role: "Member",
      status: "confirmed",
      email: "devansh.patel@example.edu",
    },
    {
      id: 4,
      name: "Sana Iyer",
      role: "Member",
      status: "pending",
      email: "sana.iyer@example.edu",
    },
  ],
  maxSize: 4,
};
