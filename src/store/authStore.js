import { create } from 'zustand';

// Concrete seed data profiles matching Adamma Payslip fields
const mockProfiles = {
  ADMIN: {
    id: "admin-001",
    name: "Vikram Sengupta",
    email: "admin.super@adamma.in",
    role: "ADMIN",
    status: "CONFIRMED",
    doj: "Jan 05, 2020",
    dob: "1980-04-12",
    mobile: "+91 98765 40001",
    designation: "Executive Director & HR Head",
    department: "Administration",
    location: "Bengaluru",
    clBalance: 12,
    elBalance: 15,
    slBalance: 8,
    compOffBalance: 2,
    bankDetails: {
      bankName: "Axis Bank Ltd",
      accountNumber: "912010012345678",
      ifscCode: "UTIB0000004",
      uan: "100987654321",
      pfMemberId: "BG/BAN/98765/123",
      pan: "ABCDE1234F"
    },
    salary: {
      baseSalary: 120000,
      hra: 48000,
      conveyance: 1600,
      medical: 1250,
      otherAllowance: 9150,
      lta: 120000,
      annualMedical: 15000,
      bonus: 150000
    },
    deductions: {
      epf: 1800,
      tds: 15000,
      profTax: 200,
      retentionAmount: 0
    },
    emergencyContact: {
      name: "Sujata Sengupta",
      relation: "Spouse",
      phone: "+91 98765 40002"
    }
  },
  MANAGER: {
    id: "mgr-001",
    name: "Meera Nair",
    email: "manager.meera@adamma.in",
    role: "MANAGER",
    status: "CONFIRMED",
    doj: "Jul 15, 2021",
    dob: "1985-08-22",
    mobile: "+91 98765 40003",
    designation: "Senior Manager - Accounts & Operations",
    department: "Finance & Accounts",
    location: "Bengaluru",
    clBalance: 10,
    elBalance: 12,
    slBalance: 6,
    compOffBalance: 1,
    bankDetails: {
      bankName: "Axis Bank Ltd",
      accountNumber: "912010087654321",
      ifscCode: "UTIB0000004",
      uan: "100987654322",
      pfMemberId: "BG/BAN/98765/124",
      pan: "FGHIJ5678K"
    },
    salary: {
      baseSalary: 85000,
      hra: 34000,
      conveyance: 1600,
      medical: 1250,
      otherAllowance: 8150,
      lta: 80000,
      annualMedical: 15000,
      bonus: 100000
    },
    deductions: {
      epf: 1800,
      tds: 8500,
      profTax: 200,
      retentionAmount: 0
    },
    emergencyContact: {
      name: "Radhika Nair",
      relation: "Mother",
      phone: "+91 98765 40004"
    }
  },
  TL: {
    id: "tl-001",
    name: "Rohan Deshmukh",
    email: "tl.rohan@adamma.in",
    role: "TL",
    status: "CONFIRMED",
    managerName: "Meera Nair",
    doj: "Mar 10, 2023",
    dob: "1990-11-05",
    mobile: "+91 98765 40005",
    designation: "Team Lead - Customer Relations",
    department: "Operations",
    location: "Bengaluru",
    clBalance: 11,
    elBalance: 8,
    slBalance: 5,
    compOffBalance: 3,
    bankDetails: {
      bankName: "HDFC Bank Ltd",
      accountNumber: "912010045612378",
      ifscCode: "HDFC0000124",
      uan: "100987654323",
      pfMemberId: "BG/BAN/98765/125",
      pan: "LMNOP9012Q"
    },
    salary: {
      baseSalary: 60000,
      hra: 24000,
      conveyance: 1600,
      medical: 1250,
      otherAllowance: 3150,
      lta: 50000,
      annualMedical: 15000,
      bonus: 75000
    },
    deductions: {
      epf: 1800,
      tds: 4500,
      profTax: 200,
      retentionAmount: 0
    },
    emergencyContact: {
      name: "Sanjay Deshmukh",
      relation: "Father",
      phone: "+91 98765 40006"
    }
  },
  EMPLOYEE: {
    id: "emp-001",
    name: "Arjun Sharma",
    email: "employee.arjun@adamma.in",
    role: "EMPLOYEE",
    status: "PROBATION",
    probationDaysLeft: 42,
    managerName: "Meera Nair",
    tlName: "Rohan Deshmukh",
    doj: "Jan 05, 2026",
    dob: "1995-06-18",
    mobile: "+91 98765 43210",
    designation: "Process Executive - Accounts",
    department: "Accounts & Administration",
    location: "Bengaluru",
    clBalance: 6,
    elBalance: 0, // Probation blocks EL accrual
    slBalance: 3,
    compOffBalance: 0,
    bankDetails: {
      bankName: "HDFC Bank Ltd",
      accountNumber: "50100456789123",
      ifscCode: "HDFC0000124",
      uan: "100987654324",
      pfMemberId: "BG/BAN/98765/126",
      pan: "RSTUV3456W"
    },
    salary: {
      baseSalary: 45000,
      hra: 18000,
      conveyance: 1600,
      medical: 1250,
      otherAllowance: 4150,
      lta: 40000,
      annualMedical: 15000,
      bonus: 50000
    },
    deductions: {
      epf: 1800,
      tds: 2500,
      profTax: 200,
      retentionAmount: 5000
    },
    emergencyContact: {
      name: "Nisha Sharma",
      relation: "Spouse",
      phone: "+91 98765 43211"
    }
  }
};

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  payrollAdjustments: {},
  announcements: [],
  unreadAnnouncementsCount: 0,
  commitPayrollAdjustment: (employeeId, adjustmentPayload) => {
    set((state) => ({
      payrollAdjustments: {
        ...state.payrollAdjustments,
        [employeeId]: adjustmentPayload
      }
    }));
  },
  login: async (role, email, password = '••••••••••••') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.otpRequired) {
          return { otpRequired: true };
        }
        set({
          isAuthenticated: true,
          token: data.token,
          user: data.user
        });
        return { otpRequired: false };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
    } catch (err) {
      console.warn('Backend server offline or auth failed, fallback to mock authentication.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err; // throw validation error if API responded with non-200
      }
    }

    // Fallback Mock Login Flow
    await new Promise((resolve) => setTimeout(resolve, 600));
    const userSession = { ...mockProfiles[role] };
    userSession.email = email;
    
    set({
      isAuthenticated: true,
      token: "mock_jwt_token_adamma_hrms",
      user: userSession
    });
    return { otpRequired: false };
  },
  verifyOtp: async (email, otp) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          token: data.token,
          user: data.user
        });
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      throw err;
    }
  },
  forgotPassword: async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        return data; // { success: true, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }
    } catch (err) {
      console.error('Password reset store action failed:', err);
      throw err;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, token: null, user: null });
  },
  updateLeaveBalances: (CL, EL, SL, COMP) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          clBalance: CL,
          elBalance: EL,
          slBalance: SL,
          compOffBalance: COMP
        }
      };
    });
  },
  updateUserProfile: (profileDetails) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          ...profileDetails
        }
      };
    });
  },
  onboardUser: async (newUserPayload) => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/auth/onboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserPayload)
      });

      if (response.ok) {
        const data = await response.json();
        return data; // { success: true, generatedPassword, emailSent, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Onboarding server error');
      }
    } catch (err) {
      console.warn('Backend onboarding failed or server offline, fallback to sandbox mock.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      // Generate secure temp password locally for sandbox
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let generatedPassword = 'AIS-P@';
      for (let i = 0; i < 6; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return {
        success: true,
        generatedPassword,
        emailSent: false,
        message: 'Onboarded locally in Sandbox Fallback (Backend Offline).'
      };
    }
  },
  updateEmployeeDetails: async (id, updatedPayload) => {
    const token = get().token;
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPayload)
      });

      if (response.ok) {
        const data = await response.json();
        return data; // { success: true, user, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Candidate update server error');
      }
    } catch (err) {
      console.warn('Backend candidate update failed, fallback to sandbox mock.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      return {
        success: true,
        message: 'Updated candidate details locally in Sandbox Fallback.'
      };
    }
  },
  deactivateUser: async (id) => {
    const token = get().token;
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${id}/deactivate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data; // { success: true, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deactivation server error');
      }
    } catch (err) {
      console.warn('Backend user deactivation failed, fallback to sandbox mock.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      return {
        success: true,
        message: 'Employee successfully deactivated locally in Sandbox Fallback.'
      };
    }
  },
  fetchEmployees: async () => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data; // returns array of formatted employee records
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve employees');
      }
    } catch (err) {
      console.warn('Backend fetch employees failed, fallback to mock lists.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      return Object.values(mockProfiles);
    }
  },
  fetchAnnouncements: async () => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.filter(ann => !ann.isRead).length;
        set({ announcements: data, unreadAnnouncementsCount: unreadCount });
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve announcements');
      }
    } catch (err) {
      console.warn('Backend fetch announcements failed, fallback to mock lists.', err);
      // Fallback sandbox mock data
      const mockAnn = [
        {
          id: 'ann-mock-1',
          title: 'Adamma Yearly Appraisal Policy Update',
          content: 'The new quarterly appraisal portal is now active for all TLs, managers, and employees. Please submit self-appraisal targets by the end of this month.',
          createdBy: { name: 'Vikram Sengupta', role: 'ADMIN' },
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: 'ann-mock-2',
          title: 'Welcome to the New HRMS Portal',
          content: 'Adamma Info Services Private Limited is proud to announce the rollout of our upgraded HRMS portal featuring Microsoft Graph, OTP security, and automated schedules.',
          createdBy: { name: 'Vikram Sengupta', role: 'ADMIN' },
          createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
          isRead: true
        }
      ];
      const unreadCount = mockAnn.filter(ann => !ann.isRead).length;
      set({ announcements: mockAnn, unreadAnnouncementsCount: unreadCount });
      return mockAnn;
    }
  },
  postAnnouncement: async (title, content) => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (response.ok) {
        const data = await response.json();
        await get().fetchAnnouncements();
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish announcement');
      }
    } catch (err) {
      console.warn('Backend post announcement failed, fallback to mock add.', err);
      const newMock = {
        id: 'ann-mock-' + Date.now(),
        title,
        content,
        createdBy: { name: get().user?.name || 'Vikram Sengupta', role: get().user?.role || 'ADMIN' },
        createdAt: new Date().toISOString(),
        isRead: true
      };
      const updatedList = [newMock, ...get().announcements];
      const unreadCount = updatedList.filter(ann => !ann.isRead).length;
      set({ announcements: updatedList, unreadAnnouncementsCount: unreadCount });
      return newMock;
    }
  },
  markAnnouncementAsRead: async (id) => {
    const token = get().token;
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}/read`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await get().fetchAnnouncements();
      }
    } catch (err) {
      console.warn('Backend mark read failed, fallback to mock state.', err);
      const updatedList = get().announcements.map(ann => {
        if (ann.id === id) {
          return { ...ann, isRead: true };
        }
        return ann;
      });
      const unreadCount = updatedList.filter(ann => !ann.isRead).length;
      set({ announcements: updatedList, unreadAnnouncementsCount: unreadCount });
    }
  },
  markAllAnnouncementsAsRead: async () => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/announcements/read-all', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await get().fetchAnnouncements();
      }
    } catch (err) {
      console.warn('Backend mark read-all failed, fallback to mock state.', err);
      const updatedList = get().announcements.map(ann => ({ ...ann, isRead: true }));
      set({ announcements: updatedList, unreadAnnouncementsCount: 0 });
    }
  },
  changePassword: async (currentPassword, newPassword) => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        const data = await response.json();
        return data; // { success: true, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
    } catch (err) {
      console.warn('Backend password change failed, fallback to mock.', err);
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
        throw err;
      }
      return {
        success: true,
        message: 'Password successfully updated locally in Sandbox Fallback.'
      };
    }
  },
  uploadProfilePic: async (base64Pic) => {
    const token = get().token;
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile-pic', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePic: base64Pic })
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state locally
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, profilePic: base64Pic } });
        }
        return data; // { success: true, profilePic, message }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      console.warn('Backend profile pic upload failed, fallback to mock state.', err);
      // Fallback sandbox: update local state
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, profilePic: base64Pic } });
      }
      return {
        success: true,
        profilePic: base64Pic,
        message: 'Profile picture successfully updated locally in Sandbox Fallback.'
      };
    }
  }
}));
