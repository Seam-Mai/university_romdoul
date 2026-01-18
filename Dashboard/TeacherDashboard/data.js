// data.js

// Helper to generate dummy students
const generateStudents = () => {
  const list = [];
  const courses = [1, 2, 3, 4]; // Course IDs
  // Create 60 students distributed across courses
  for (let i = 1; i <= 60; i++) {
    let cId = courses[Math.floor(Math.random() * courses.length)];
    // Force counts: Java(1)=15, HTML(3)=10, C++(4)=25, Others=2
    if (i <= 15) cId = 1;
    else if (i <= 25) cId = 3;
    else if (i <= 50) cId = 4;
    else cId = 2;

    list.push({
      id: `STU${2025000 + i}`,
      name: `Student ${i}`,
      email: `student${i}@school.edu`,
      courseId: cId,
      attendance: Math.floor(Math.random() * 30) + 70, // 70-100%
      assignmentStatus: Math.random() > 0.3 ? "Complete" : "Pending",
      grade: Math.floor(Math.random() * 100),
    });
  }
  return list;
};

// Export the Mock Database
export const MOCK_DB = {
  courses: [
    {
      id: 1,
      name: "Spring Boot Framework",
      code: "ITE401",
      students: 15,
      max: 30,
      isFull: false,
      img: "fa-leaf",
      color: "green",
    },
    {
      id: 2,
      name: "Advanced Java",
      code: "ITE302",
      students: 15,
      max: 20,
      isFull: false,
      img: "fa-coffee",
      color: "red",
    },
    {
      id: 3,
      name: "Web Development (HTML)",
      code: "ITE101",
      students: 10,
      max: 40,
      isFull: false,
      img: "fa-code",
      color: "blue",
    },
    {
      id: 4,
      name: "C++ Programming",
      code: "CS201",
      students: 25,
      max: 25,
      isFull: true,
      img: "fa-microchip",
      color: "purple",
    },
  ],
  students: generateStudents(),
  assignments: [
    {
      id: 1,
      title: "REST API Design",
      courseId: 1,
      dueDate: "2025-12-25",
      pending: 5,
    },
    {
      id: 2,
      title: "Pointer Arithmetic",
      courseId: 4,
      dueDate: "2025-12-22",
      pending: 12,
    },
  ],
  messages: [
    {
      id: 1,
      from: "John Doe",
      text: "Sir, I will be late today.",
      time: "10:00 AM",
      unread: true,
    },
    {
      id: 2,
      from: "Admin",
      text: "Meeting at 2 PM.",
      time: "Yesterday",
      unread: false,
    },
  ],
};
