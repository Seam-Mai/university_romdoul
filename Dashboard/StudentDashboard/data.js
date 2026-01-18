// 1. Classmates Data Generation
const classmatesData = [];
for (let i = 1; i <= 20; i++) {
  classmatesData.push({
    name: `Student ${i}`,
    id: `20250${i < 10 ? "0" + i : i}`,
    email: `student${i}@uni.edu`,
    status: Math.random() > 0.2 ? "Active" : "Offline",
    totalDays: Math.floor(Math.random() * 30) + 10,
  });
}

// 2. Messages Data
const messagesData = [
  {
    id: 1,
    from: "Dr. Sarah Smith",
    text: "Don't forget the deadline tomorrow!",
    time: "10:30 AM",
    type: "received",
  },
  {
    id: 2,
    from: "Me",
    text: "Yes, professor. I am working on it.",
    time: "10:35 AM",
    type: "sent",
  },
  {
    id: 3,
    from: "Dr. Sarah Smith",
    text: "Great. Let me know if you need help.",
    time: "10:36 AM",
    type: "received",
  },
];

// 3. Attendance Data
const attendanceData = [
  { id: 1, roll: "2025001", name: "Student 1", days: 15 },
  { id: 2, roll: "2025002", name: "Student 2", days: 39 },
  { id: 3, roll: "2025003", name: "Student 3", days: 11 },
  { id: 4, roll: "2025004", name: "Student 4", days: 31 },
  { id: 5, roll: "2025005", name: "Student 5", days: 27 },
];

// Export all data
export const MOCK_DB = {
  classmates: classmatesData,
  messages: messagesData,
  attendance: attendanceData,
};
