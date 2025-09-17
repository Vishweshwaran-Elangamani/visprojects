import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { HRDashboard } from './components/HRDashboard';
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { api } from "./components/ui/api";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  project: string;
  workplace: string;
  designation: string;
  firstLogin: boolean;
};
// Mock data structure with sample data
const initialData = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'Admin',
      project: 'System Administration',
      workplace: 'Head Office',
      designation: 'System Administrator',
      firstLogin: false
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      password: 'employee123',
      role: 'Employee',
      project: 'Web Development',
      workplace: 'Tech Hub',
      designation: 'Senior Developer',
      firstLogin: false
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@company.com',
      password: 'hr123',
      role: 'HR',
      project: 'Human Resources',
      workplace: 'Head Office',
      designation: 'HR Manager',
      firstLogin: false
    }
  ],
  jobs: [
    {
      id: 1,
      title: 'Frontend Developer',
      description: 'We are looking for a skilled Frontend Developer to join our dynamic team. The ideal candidate should have experience with React, TypeScript, and modern web technologies. You will be responsible for creating responsive, user-friendly interfaces and collaborating with our design and backend teams.',
      referralBonus: 2500,
      createdBy: 3,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'Product Manager',
      description: 'Join our product team as a Product Manager! We need someone with strong analytical skills and experience in product strategy. You will work closely with engineering, design, and marketing teams to deliver exceptional products that meet customer needs.',
      referralBonus: 3000,
      createdBy: 3,
      createdAt: '2024-01-16T14:30:00Z'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      description: 'Looking for a DevOps Engineer to help scale our infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines is required. You will be responsible for maintaining our deployment systems and ensuring high availability.',
      referralBonus: 2800,
      createdBy: 3,
      createdAt: '2024-01-17T09:15:00Z'
    }
  ],
  referrals: [
    {
      id: 1,
      candidateName: 'John Smith',
      currentCompany: 'TechCorp Inc',
      candidateEmail: 'john.smith@email.com',
      resume: 'john_smith_resume.pdf',
      jobId: 1,
      employeeId: 2,
      status: 'verified',
      interviewDateTime: null,
      submittedAt: '2024-01-18T11:20:00Z'
    },
    {
      id: 2,
      candidateName: 'Emma Davis',
      currentCompany: 'StartupXYZ',
      candidateEmail: 'emma.davis@email.com',
      resume: 'emma_davis_resume.pdf',
      jobId: 2,
      employeeId: 2,
      status: 'interviewed',
      interviewDateTime: '2024-01-25T15:00:00Z',
      submittedAt: '2024-01-19T16:45:00Z'
    },
    {
      id: 3,
      candidateName: 'Alex Rodriguez',
      currentCompany: 'DevSolutions',
      candidateEmail: 'alex.rodriguez@email.com',
      resume: 'alex_rodriguez_resume.pdf',
      jobId: 1,
      employeeId: 2,
      status: 'confirmed',
      interviewDateTime: '2024-01-22T10:00:00Z',
      submittedAt: '2024-01-20T08:30:00Z'
    }
  ],
  referralLimits: {
    2: 8  // Sarah Johnson has a limit of 8 referrals
  },
  earnings: [
    {
      id: 1,
      referralId: 3,
      amount: 2500,
      date: '2024-01-23T12:00:00Z'
    }
  ]
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const refreshEarnings = async (employeeId: number) => {
    try {
      const data = await api.getEmployeeEarnings(employeeId);
      setEarnings(data);
    } catch {}
  };
  const [jobs, setJobs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [referralLimits, setReferralLimits] = useState<{ [key: string]: number }>({});
  const [earnings, setEarnings] = useState<any[]>([]);
  // Fetch all data on mount
  useEffect(() => {
    refreshJobs();
    refreshReferrals();
    refreshUsers();
    refreshReferralLimits();
    if (currentUser && currentUser.role === 'Employee') {
      refreshEarnings(currentUser.id);
    }
  }, []);

  // Auto-refresh all data every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshJobs();
      refreshReferrals();
      refreshUsers();
      refreshReferralLimits();
      if (currentUser && currentUser.role === 'Employee') {
        refreshEarnings(currentUser.id);
      }
    }, 2000);
    return () => clearInterval(interval);
  const refreshEarnings = async (employeeId: number) => {
    try {
      const data = await api.getEmployeeEarnings(employeeId);
      setEarnings(data);
    } catch {}
  };
  }, []);

  const refreshJobs = async () => {
    try {
      const data = await api.getJobs?.();
      if (data) setJobs(data);
    } catch {}
  };
  const refreshReferrals = async () => {
    try {
      const data = await api.getReferrals();
      setReferrals(data);
    } catch {}
  };
  const refreshUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {}
  };
  const refreshReferralLimits = async () => {
    try {
      const data = await api.getReferralLimits();
      setReferralLimits(data);
    } catch {}
  };

  // Accepts a user object from Login component
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  const onUserUpdate = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Login onLogin={async (email: string, password: string) => {
          try {
            const user = await api.login(email, password);
            handleLogin(user);
          } catch {
            toast.error('Invalid email or password');
          }
        }} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
  {currentUser.role === 'Admin' && (
        <AdminDashboard 
          user={currentUser} 
          data={{ users, jobs, referrals, referralLimits }}
          updateData={updated => {
            if (updated.users) setUsers(updated.users);
            if (updated.jobs) setJobs(updated.jobs);
            if (updated.referrals) setReferrals(updated.referrals);
            if (updated.referralLimits) setReferralLimits(updated.referralLimits);
          }}
          onLogout={handleLogout}
        />
      )}
      {currentUser.role === 'Employee' && (
        <EmployeeDashboard 
          user={currentUser} 
          data={{
            users: users || [],
            jobs: jobs || [],
            referrals: referrals || [],
            referralLimits: referralLimits || [],
            earnings: earnings || []
          }}
          updateData={() => {}}
          updateCurrentUser={onUserUpdate}
          onLogout={handleLogout}
        />
      )}
      {currentUser.role === 'HR' && (
        <HRDashboard 
          user={currentUser}
          onLogout={handleLogout}
          onUserUpdate={onUserUpdate}
          jobs={jobs}
          setJobs={setJobs}
          referrals={referrals}
          setReferrals={setReferrals}
          users={users}
          setUsers={setUsers}
          referralLimits={referralLimits}
          setReferralLimits={setReferralLimits}
          refreshJobs={refreshJobs}
          refreshReferrals={refreshReferrals}
          refreshUsers={refreshUsers}
          refreshReferralLimits={refreshReferralLimits}
        />
      )}
      <Toaster />
    </div>
  );
}