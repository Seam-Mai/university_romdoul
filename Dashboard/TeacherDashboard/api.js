// api.js
const API_BASE_URL = "http://206.189.155.117/api/api";

// 1. Helper for Fetching
async function fetchWithErrorHandling(url, options = {}) {
  // ✅ GET TOKEN FROM STORAGE
  const token = localStorage.getItem("token");

  // ✅ ATTACH HEADERS
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      headers: headers,
      ...options,
    });

    // ✅ HANDLE AUTH ERRORS (401/403)
    if (response.status === 401 || response.status === 403) {
      // Only redirect if not already on login page
      if (!window.location.href.includes("login.html")) {
        alert("Session Expired. Please Login Again.");
        // Adjust path based on where your login.html is
        // Assuming structure: /Dashboard/Teacher/index.html -> ../../login.html
        window.location.href = "../../login.html";
      }
      return null;
    }

    if (!response.ok) {
      if (response.status === 204) return null;
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    return null;
  }
}

// 2. The API Object
export const API = {
  // --- COURSES ---
  async getAllCourses() {
    try {
      const data = await fetchWithErrorHandling(
        `${API_BASE_URL}/courses/getAll`,
      );
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Alias for Student Dashboard compatibility
  async getCourses() {
    return this.getAllCourses();
  },

  async createCourse(data) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/courses/save`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // --- STUDENTS & CLASSMATES ---
  async getStudents(page = 0, size = 10, courseId = null, search = "") {
    const params = new URLSearchParams({ page, size });
    if (courseId) params.append("courseId", courseId);
    if (search) params.append("search", search);
    return await fetchWithErrorHandling(
      `${API_BASE_URL}/students?${params.toString()}`,
    );
  },

  async getStudentsByCourse(courseId) {
    return await fetchWithErrorHandling(
      `${API_BASE_URL}/students?courseId=${courseId}&size=100`,
    );
  },

  // Alias for Student Dashboard
  async getClassmates() {
    const data = await fetchWithErrorHandling(
      `${API_BASE_URL}/students?size=50`,
    );
    return data ? data.content : [];
  },

  // --- ATTENDANCE ---
  async getAllAttendances() {
    const data = await fetchWithErrorHandling(`${API_BASE_URL}/attendance/all`);
    return data || [];
  },

  // Alias
  async getAttendance() {
    return this.getAllAttendances();
  },

  async bulkSaveAttendance(records) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/attendance/bulk`, {
      method: "POST",
      body: JSON.stringify(records),
    });
  },

  // --- ASSIGNMENTS ---
  async getAllAssignments() {
    try {
      const data = await fetchWithErrorHandling(
        `${API_BASE_URL}/v1/assignments`,
      );
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Alias
  async getAssignments() {
    return this.getAllAssignments();
  },

  async createAssignment(data) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/v1/assignments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // --- STUDENT GRADES ---
  async getAllStudentGrades() {
    try {
      const data = await fetchWithErrorHandling(
        `${API_BASE_URL}/v1/student-grades`,
      );
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Alias
  async getGrades() {
    return this.getAllStudentGrades();
  },

  async updateStudentGrade(id, gradeValue) {
    // 1. Get current data
    const currentData = await fetchWithErrorHandling(
      `${API_BASE_URL}/v1/student-grades/${id}`,
    );
    if (!currentData) return;

    // 2. Update
    return await fetchWithErrorHandling(
      `${API_BASE_URL}/v1/student-grades/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...currentData,
          points: gradeValue,
        }),
      },
    );
  },

  // --- MESSAGES ---
  async getAllMessages() {
    return [
      {
        id: 1,
        from: "John Doe",
        text: "Hello Professor, I have a question.",
        time: "10:30 AM",
        unread: true,
      },
      {
        id: 2,
        from: "Sarah Lee",
        text: "Thank you for the feedback!",
        time: "09:15 AM",
        unread: false,
      },
    ];
  },

  // Alias
  async getMessages() {
    return this.getAllMessages();
  },

  async sendMessage(messageData) {
    console.log("Sending message:", messageData);
    return { success: true, ...messageData };
  },

  // --- DASHBOARD DATA LOADER (TEACHER) ---
  async getAllData() {
    try {
      const [courses, assignments, grades, messages] = await Promise.all([
        this.getAllCourses(),
        this.getAllAssignments(),
        this.getAllStudentGrades(),
        this.getAllMessages(),
      ]);

      // Map for Teacher Dashboard
      const mappedStudents = grades.map((s) => ({
        id: s.id, // DB ID
        studentId: s.studentId,
        name: s.studentName,
        courseId: s.courseId,
        grade: s.points || 0,
        assignmentStatus: "Pending", // Mock
        attendance: 90, // Mock
      }));

      const mappedCourses = courses.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        students: c.students || 0,
        max: c.max || 40,
        isFull: c.isFull || false,
        img: c.img || "fa-book",
        color: c.color || "indigo",
      }));

      const mappedAssignments = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        courseId: a.courseId,
        dueDate: a.dueDate,
        pending: 0,
      }));

      return {
        courses: mappedCourses,
        assignments: mappedAssignments,
        students: mappedStudents,
        messages: messages || [],
      };
    } catch (e) {
      console.error(e);
      return { courses: [], assignments: [], students: [], messages: [] };
    }
  },

  // New method for monthly attendance overview
  async getMonthlyAttendanceOverview(courseId, year, month) {
    const url = `${API_BASE_URL}/attendance/monthly-overview?courseId=${courseId}&year=${year}&month=${month}`;
    console.log("🔍 Calling API:", url);

    try {
      const data = await fetchWithErrorHandling(url);
      console.log("✅ API Response:", data);
      console.log("📊 Number of students:", data?.length || 0);

      if (data && data.length > 0) {
        console.log("👤 First student sample:", data[0]);
      }

      return data || [];
    } catch (e) {
      console.error("❌ API Error:", e);
      return [];
    }
  },

  // --- DASHBOARD DATA LOADER (STUDENT) ---
  async getDashboardData() {
    const [courses, assignments, grades, attendance] = await Promise.all([
      this.getAllCourses(),
      this.getAllAssignments(),
      this.getAllStudentGrades(),
      this.getAllAttendances(),
    ]);

    // Mock calculations
    return {
      coursesCount: courses.length,
      assignmentsCount: assignments.length,
      gpa: "3.5",
      attendancePct: "95%",
      courses: courses.slice(0, 3),
      assignments: assignments.slice(0, 3),
    };
  },
};

// Global helper for image upload
window.toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// In api.js, add this method to the API object

export default API;
