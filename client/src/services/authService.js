// Mock authentication service with sample data
// In production, this would connect to real API endpoints

const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@neub.edu.bd',
    role: 'student',
    department: 'CSE',
    studentId: '190104121',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@neub.edu.bd',
    role: 'organizer',
    organizationName: 'CSE Society',
    organizationCode: 'CSE-SOC-001',
  },
  {
    id: '3',
    name: 'Dr. Ahmed Rahman',
    email: 'ahmed@neub.edu.bd',
    role: 'faculty',
    department: 'CSE',
    teacherId: 'FAC001',
  },
  {
    id: '4',
    name: 'Staff Member',
    email: 'staff@neub.edu.bd',
    role: 'staff',
    staffId: 'STF001',
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@neub.edu.bd',
    role: 'admin',
  },
];

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email, password) {
    await delay();
    
    // Mock authentication
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      throw new Error('Invalid email or password');
    }
    
    const token = 'mock_jwt_token_' + user.id;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  },

  async register(userData) {
    await delay();
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      // Role is already included in userData, no need to override
    };
    
    MOCK_USERS.push(newUser);
    
    const token = 'mock_jwt_token_' + newUser.id;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return { user: newUser, token };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async updateProfile(userData) {
    await delay();
    
    const currentUser = this.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },
};
