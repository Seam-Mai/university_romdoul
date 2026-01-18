import { API } from "./api.js";

// ==========================
// STATE MANAGEMENT
// ==========================
let studentState = {
  page: 0,
  search: "",
  courseFilter: "",
  data: [],
};

let attendanceState = {
  courseId: null,
  students: [],
  changes: {}, // Store unsaved changes: { studentId: "Present" }
};

// ==========================
// STUDENT LOGIC
// ==========================

export async function loadStudents(page = 0) {
  studentState.page = page;
  const container = document.querySelector("#students-table-body");
  if (!container) return; // Not on students page

  container.innerHTML =
    '<tr><td colspan="5" class="text-center p-4">Loading...</td></tr>';

  try {
    const response = await API.getStudents(
      studentState.page,
      10,
      studentState.courseFilter || null,
      studentState.search
    );

    studentState.data = response.content;
    renderStudentRows(response.content, container);
    updatePaginationUI(response);
  } catch (error) {
    container.innerHTML =
      '<tr><td colspan="5" class="text-center text-red-500 p-4">Error loading data</td></tr>';
  }
}

function renderStudentRows(students, container) {
  if (students.length === 0) {
    container.innerHTML =
      '<tr><td colspan="5" class="text-center p-8 text-gray-500">No students found</td></tr>';
    return;
  }

  container.innerHTML = students
    .map(
      (s) => `
        <tr class="hover:bg-gray-50 border-b">
            <td class="p-4 flex items-center gap-3">
                <img src="https://ui-avatars.com/api/?name=${
                  s.name
                }&background=random" class="w-8 h-8 rounded-full">
                <div>
                    <p class="font-bold text-gray-800">${s.name}</p>
                    <p class="text-xs text-gray-500">ID: ${s.id}</p>
                </div>
            </td>
            <td class="p-4">
                ${
                  s.courses && s.courses.length > 0
                    ? `<span class="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">${s.courses[0].code}</span>`
                    : '<span class="text-gray-400 text-xs">No Course</span>'
                }
            </td>
            <td class="p-4 text-gray-600">${s.email || "N/A"}</td>
            <td class="p-4"><span class="text-green-600 text-sm font-medium">Active</span></td>
            <td class="p-4 text-center">
                 <button onclick="window.router('messages')" class="text-indigo-600 hover:bg-indigo-50 p-2 rounded"><i class="fas fa-envelope"></i></button>
            </td>
        </tr>
    `
    )
    .join("");
}

function updatePaginationUI(pageData) {
  const info = document.getElementById("page-info");
  const prev = document.getElementById("btn-prev");
  const next = document.getElementById("btn-next");

  if (info)
    info.innerText = `Page ${pageData.number + 1} of ${pageData.totalPages}`;

  if (prev) {
    prev.disabled = pageData.first;
    prev.onclick = () => loadStudents(pageData.number - 1);
    prev.classList.toggle("opacity-50", pageData.first);
  }

  if (next) {
    next.disabled = pageData.last;
    next.onclick = () => loadStudents(pageData.number + 1);
    next.classList.toggle("opacity-50", pageData.last);
  }
}

// Global search handler
window.handleStudentSearch = (val) => {
  studentState.search = val;
  loadStudents(0);
};

window.handleStudentFilter = (val) => {
  studentState.courseFilter = val;
  loadStudents(0);
};

// ==========================
// ATTENDANCE LOGIC
// ==========================

export async function loadAttendanceView() {
  // 1. Load Courses into dropdown
  const courses = await API.getAllCourses();
  const select = document.getElementById("attFilter");
  if (select) {
    select.innerHTML =
      `<option value="">Select a Course...</option>` +
      courses.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

    // Listener for course change
    select.addEventListener("change", (e) =>
      loadAttendanceData(e.target.value)
    );
  }
}

async function loadAttendanceData(courseId) {
  if (!courseId) return;
  attendanceState.courseId = courseId;
  attendanceState.changes = {}; // Reset changes

  const container = document.getElementById("attendance-table-body");
  container.innerHTML =
    '<tr><td colspan="4" class="text-center p-4">Loading Class List...</td></tr>';

  try {
    // Fetch all students in this course
    const response = await API.getStudentsByCourse(courseId);
    attendanceState.students = response.content || [];
    renderAttendanceRows();
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<tr><td colspan="4" class="text-center text-red-500 p-4">Failed to load students</td></tr>';
  }
}

function renderAttendanceRows() {
  const container = document.getElementById("attendance-table-body");
  const students = attendanceState.students;

  if (students.length === 0) {
    container.innerHTML =
      '<tr><td colspan="4" class="text-center p-8">No students enrolled in this course.</td></tr>';
    return;
  }

  // Default time for display
  const timeNow = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  container.innerHTML = students
    .map(
      (s) => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-4 font-medium">
                ${s.name} <br> <span class="text-xs text-gray-400">${s.id}</span>
            </td>
            <td class="p-4">
                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs" id="status-badge-${s.id}">
                    Unmarked
                </span>
            </td>
            <td class="p-4 text-sm text-gray-600">${timeNow}</td>
            <td class="p-4">
                <select onchange="window.trackAttendance(${s.id}, this.value)" 
                        class="border rounded text-sm p-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Set Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                </select>
            </td>
        </tr>
    `
    )
    .join("");
}

// Track changes locally
window.trackAttendance = (studentId, status) => {
  if (!status) return;
  attendanceState.changes[studentId] = status;

  // Update Badge UI immediately
  const badge = document.getElementById(`status-badge-${studentId}`);
  const colors = { Present: "green", Absent: "red", Late: "yellow" };
  badge.className = `bg-${colors[status]}-100 text-${colors[status]}-700 px-2 py-1 rounded text-xs font-bold transition-colors`;
  badge.innerText = status;

  // Show save button feedback
  const btn = document.getElementById("btn-save-attendance");
  btn.innerHTML = `<i class="fas fa-save mr-2"></i>Save (${
    Object.keys(attendanceState.changes).length
  })`;
  btn.classList.add("bg-indigo-600", "text-white");
  btn.classList.remove("bg-gray-200", "text-gray-500");
};

// Send changes to Backend
// Inside student-attendance.js

window.saveAttendance = async () => {
  const updates = Object.keys(attendanceState.changes).map((studentId) => ({
    studentId: parseInt(studentId),
    courseId: parseInt(attendanceState.courseId),
    attendanceDate: new Date().toISOString().split("T")[0],
    status: attendanceState.changes[studentId],

    checkInTime: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    // This sends "17:21:24" instead of "5:21:24 PM"
  }));

  if (updates.length === 0) return alert("No changes to save.");

  try {
    await API.bulkSaveAttendance(updates);
    alert("✅ Attendance Saved Successfully!");
    attendanceState.changes = {};
    document.getElementById(
      "btn-save-attendance"
    ).innerHTML = `<i class="fas fa-save mr-2"></i>Save`;
  } catch (e) {
    console.error(e);
    alert("❌ Error saving attendance. Check console.");
  }
};

window.exportAttendanceCSV = () => {
  if (!attendanceState.students.length) return alert("No data to export");

  let csvContent = "data:text/csv;charset=utf-8,Student ID,Name,Status,Time\n";
  attendanceState.students.forEach((s) => {
    const status = attendanceState.changes[s.id] || "Unmarked";
    csvContent += `${s.id},${
      s.name
    },${status},${new Date().toLocaleTimeString()}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `attendance_${attendanceState.courseId}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
