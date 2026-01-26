const API_BASE_URL = "http://206.189.94.76:8080/api";
const PAYMENT_BASE_URL = "http://206.189.94.76:8080";

async function fetchWithErrorHandling(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { mode: "cors", headers, ...options });

    if (response.status === 401 || response.status === 403) {
      console.warn("Unauthorized access");
      return null;
    }

    if (!response.ok) {
      console.error(`Error ${response.status}:`, await response.text());
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const API = {
  // --- Existing Methods ---
  async checkTransactionStatus(paymentId) {
    return await fetchWithErrorHandling(
      `${PAYMENT_BASE_URL}/payments/check/${paymentId}`,
      {
        method: "POST",
      },
    );
  },
  async getAllCourses() {
    return (
      (await fetchWithErrorHandling(`${API_BASE_URL}/courses/getAll`)) || []
    );
  },
  async getCourses() {
    return this.getAllCourses();
  },
  async getClassmates() {
    return (
      (await fetchWithErrorHandling(`${API_BASE_URL}/students?size=50`))
        ?.content || []
    );
  },
  async getAssignments() {
    return (
      (await fetchWithErrorHandling(`${API_BASE_URL}/v1/assignments`)) || []
    );
  },
  async getGrades() {
    return (
      (await fetchWithErrorHandling(`${API_BASE_URL}/v1/student-grades`)) || []
    );
  },
  async getAttendance() {
    return (
      (await fetchWithErrorHandling(`${API_BASE_URL}/attendance/all`)) || []
    );
  },
  async getDashboardData() {
    return {
      coursesCount: 5,
      assignmentsCount: 3,
      gpa: "3.5",
      attendancePct: "98%",
    };
  },
  async getMessages() {
    return [];
  },

  // --- Payment Methods ---
  async createPayment(amount, description) {
    // Ensure amount is a number
    const numAmount = parseFloat(amount);

    const user = JSON.parse(localStorage.getItem("user")) || {
      fullName: "Student",
      email: "student@school.edu",
      phoneNumber: "012000000",
    };

    return await fetchWithErrorHandling(
      `${PAYMENT_BASE_URL}/user-payment/create-payment`,
      {
        method: "POST",
        body: JSON.stringify({
          name: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          amount: numAmount, // Send as number
          description,
        }),
      },
    );
  },

  async getUserPayments() {
    const data = await fetchWithErrorHandling(
      `${PAYMENT_BASE_URL}/payments/all`,
    );
    return Array.isArray(data) ? data : [];
  },

  // ✅ Secure Image Fetching
  async fetchQRImage(qrString) {
    if (!qrString) return null;
    const url = `${PAYMENT_BASE_URL}/khqr/generate/image?qr=${encodeURIComponent(qrString)}&format=png`;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load image");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("QR Image Error:", e);
      // Return a placeholder if fails
      return "https://via.placeholder.com/250?text=QR+Error";
    }
  },
  async getStudentTuition() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) return null;
    return await fetchWithErrorHandling(
      `${PAYMENT_BASE_URL}/payments/my-tuition?email=${user.email}`,
    );
  },
};
