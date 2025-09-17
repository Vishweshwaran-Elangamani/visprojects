import React, { useState, useEffect } from 'react';

// Track dialog shown per user for this session (global, not reset on refresh)
const passwordDialogSession: { [userId: number]: boolean } = {};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { LogOut, User, Briefcase, FileText, DollarSign, Key, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "./ui/api";

interface User {
  id: number | string;
  name?: string;
  role?: string;
  project?: string;
  workplace?: string;
  designation?: string;
  email?: string;
  firstLogin?: boolean;
}

export function EmployeeDashboard({
  user,
  data,
  updateData,
  updateCurrentUser,
  onLogout
}: {
  user: User;
  data: any;
  updateData: (data: any) => void;
  updateCurrentUser: (user: User) => void;
  onLogout: () => void;
}) {

  // Defensive: always use arrays/objects, never undefined
  const users = (data && data.users) ? data.users : [];
  const jobs = (data && data.jobs) ? data.jobs : [];
  const referrals = (data && data.referrals) ? data.referrals : [];
  const referralLimits = (data && data.referralLimits) ? data.referralLimits : {};
  const earnings = (data && data.earnings) ? data.earnings : [];
  // Debug: log referralLimits mapping and user.id on every render
  React.useEffect(() => {
    console.log('EmployeeDashboard referralLimits:', referralLimits, 'user.id:', user.id);
    const userLimit = referralLimits[user.id] ?? 5;
    console.log('EmployeeDashboard userLimit:', userLimit);
  }, [referralLimits, user.id]);

  const [activeView, setActiveView] = useState('profile');
  // Only show password dialog once after login, not on every refresh
  // Show password dialog only on initial login, never on refresh, persist across tabs
  const passwordDialogKey = `passwordDialogShown_${user.id}`;
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(() => {
    if (user.firstLogin && !localStorage.getItem(passwordDialogKey)) {
      localStorage.setItem(passwordDialogKey, 'true');
      return true;
    }
    return false;
  });
  // Reset dialog shown flag on logout
  const handleLogoutWrapper = () => {
    localStorage.removeItem(passwordDialogKey);
    onLogout();
  };
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [referralForm, setReferralForm] = useState<ReferralForm>({
    candidateName: '',
    currentCompany: '',
    candidateEmail: '',
    resume: null
  });

  interface Referral {
    id: number | string;
    employeeId: number | string;
    candidateName: string;
    currentCompany: string;
    candidateEmail: string;
    jobId: number | string;
    status: string;
    interviewDateTime?: string;
    submittedAt?: string;
  }

  const userReferrals: Referral[] = referrals.filter((r: Referral) => r.employeeId === user.id);
  // Always use the latest referral limit from backend
  const userLimit = referralLimits[user.id] ?? 5;
  // Debug: log the userLimit value
  console.log('EmployeeDashboard userLimit:', userLimit);
  interface Referral {
    id: number | string;
    employeeId: number | string;
    candidateName: string;
    currentCompany: string;
    candidateEmail: string;
    jobId: number | string;
    status: string;
    interviewDateTime?: string;
    submittedAt?: string;
  }

  interface UserEarning {
    id: number | string;
    referralId: number | string;
    amount: number;
    date: string;
  }

  const userEarnings: UserEarning[] = earnings.filter((e: UserEarning) => {
    const referral: Referral | undefined = referrals.find((r: Referral) => r.id === e.referralId && r.employeeId === user.id);
    return referral && referral.status === "Confirmed";
  });
  interface Earning {
    id: number | string;
    referralId: number | string;
    amount: number;
    date: string;
  }

  const totalEarnings: number = userEarnings.reduce((sum: number, e: Earning) => sum + e.amount, 0);

  interface PasswordForm {
    current: string;
    new: string;
    confirm: string;
  }

  interface HandlePasswordChangeEvent extends React.FormEvent<HTMLFormElement> {}

  const handlePasswordChange = (e: HandlePasswordChangeEvent): void => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    api.changeEmployeePassword(
      Number(user.id),
      passwordForm.current,
      passwordForm.new,
      passwordForm.confirm
    ).then(() => {
      const updatedUser = { ...user, password: passwordForm.new, firstLogin: false };
      updateCurrentUser(updatedUser);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setIsPasswordDialogOpen(false);
      localStorage.setItem(passwordDialogKey, 'true');
      toast.success('Password updated successfully!');
    }).catch((err: { message?: string }) => {
      toast.error('Failed to update password: ' + (err && err.message ? err.message : ''));
    });
    toast.success('Password updated successfully');
  };

  interface ReferralForm {
    candidateName: string;
    currentCompany: string;
    candidateEmail: string;
    resume: File | null;
  }

  interface Job {
    id: number | string;
    title: string;
    referralBonus?: number;
    description?: string;
  }

  interface User {
    id: number | string;
    name?: string;
    role?: string;
    project?: string;
    workplace?: string;
    designation?: string;
    email?: string;
    firstLogin?: boolean;
  }

  interface ReferralSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleReferralSubmit = async (
    e: ReferralSubmitEvent
  ): Promise<void> => {
    e.preventDefault();
    if (userReferrals.length >= userLimit) {
      toast.error(`You have reached your referral limit of ${userLimit}`);
      return;
    }
    if (!referralForm.resume) {
      toast.error('Please upload a PDF resume.');
      return;
    }
    const formData = new FormData();
    formData.append('candidateName', referralForm.candidateName);
    formData.append('currentCompany', referralForm.currentCompany);
    formData.append('candidateEmail', referralForm.candidateEmail);
    if (!selectedJob) {
      toast.error('No job selected for referral.');
      return;
    }
    formData.append('jobId', (selectedJob as Job).id.toString());
    formData.append('employeeId', user.id.toString());
    formData.append('resume', referralForm.resume);
    try {
      await fetch('http://localhost:5019/api/employee/referral-with-pdf', {
        method: 'POST',
        body: formData
      });
      setReferralForm({
        candidateName: '',
        currentCompany: '',
        candidateEmail: '',
        resume: null
      });
      setSelectedJob(null);
      toast.success('Referral submitted successfully!');
    } catch {
      toast.error('Failed to submit referral. Please try again.');
    }
  };

  interface StatusColorMap {
    [key: string]: string;
  }

  const getStatusColor = (status: string): string => {
    const statusColors: StatusColorMap = {
      verified: 'bg-blue-100 text-blue-800',
      interviewed: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  interface StatusIconProps {
    status: string;
  }

  const getStatusIcon = (status: string): React.JSX.Element => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'interviewed': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'status', label: 'Status', icon: FileText },
    { id: 'earnings', label: 'Referral Earnings', icon: DollarSign },
    { id: 'password', label: 'Change Password', icon: Key }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2>Employee Portal</h2>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="outline" onClick={onLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          <header className="border-b bg-card p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1>{sidebarItems.find(item => item.id === activeView)?.label}</h1>
            </div>
          </header>

          <div className="p-6">
            {activeView === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p>{user.name}</p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <p>{user.role}</p>
                    </div>
                    <div>
                      <Label>Project</Label>
                      <p>{user.project}</p>
                    </div>
                    <div>
                      <Label>Place of Work</Label>
                      <p>{user.workplace}</p>
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <p>{user.designation}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p>{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'jobs' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                    {data.jobs.map((job: Job) => (
                    <Card key={job.id}>
                      <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>Referral Bonus: ${job.referralBonus}</CardDescription>
                      </CardHeader>
                      <CardContent>
                      <p className="mb-4">{job.description}</p>
                      <Button onClick={() => setSelectedJob(job)}>
                        Refer Candidate
                      </Button>
                      </CardContent>
                    </Card>
                    ))}
                  {data.jobs.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No jobs available at the moment.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedJob && (
                  <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Refer Candidate for {selectedJob.title}</DialogTitle>
                        <DialogDescription>
                          Referral limit: {userReferrals.length}/{userLimit}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleReferralSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="candidateName">Candidate's Name</Label>
                          <Input
                            id="candidateName"
                            value={referralForm.candidateName}
                            onChange={(e) => setReferralForm({...referralForm, candidateName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentCompany">Current Company</Label>
                          <Input
                            id="currentCompany"
                            value={referralForm.currentCompany}
                            onChange={(e) => setReferralForm({...referralForm, currentCompany: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="candidateEmail">Candidate Email</Label>
                          <Input
                            id="candidateEmail"
                            type="email"
                            value={referralForm.candidateEmail}
                            onChange={(e) => setReferralForm({...referralForm, candidateEmail: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="resume">Resume (PDF)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="resume"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setReferralForm({...referralForm, resume: e.target.files ? e.target.files[0] : null})}
                              required
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={userReferrals.length >= userLimit}>
                          Submit Referral
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}

            {activeView === 'status' && (
              <div className="space-y-4">
                {userReferrals.map(referral => {
                  const job: Job | undefined = (data.jobs as Job[]).find((j: Job) => j.id === referral.jobId);
                  return (
                    <Card key={referral.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{referral.candidateName}</CardTitle>
                          <Badge className={getStatusColor(referral.status)}>
                            {getStatusIcon(referral.status)}
                            <span className="ml-1 capitalize">{referral.status || 'Pending'}</span>
                          </Badge>
                        </div>
                        <CardDescription>{job?.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Company:</strong> {referral.currentCompany}</p>
                          <p><strong>Email:</strong> {referral.candidateEmail}</p>
                          {referral.interviewDateTime && (
                            <p><strong>Interview:</strong> {new Date(referral.interviewDateTime).toLocaleString()}</p>
                          )}
                          <p><strong>Submitted:</strong> {
                            referral.submittedAt && new Date(referral.submittedAt).getFullYear() !== 1970
                              ? new Date(referral.submittedAt).toLocaleDateString()
                              : 'Not available'
                          }</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {userReferrals.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No referrals submitted yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeView === 'earnings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">${totalEarnings}</div>
                    <p className="text-muted-foreground">From {userEarnings.length} confirmed referrals</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {userEarnings.map(earning => {
                    const referral: Referral | undefined = (data.referrals as Referral[]).find((r: Referral) => r.id === earning.referralId);
                    const job: Job | undefined = (data.jobs as Job[]).find((j: Job) => j.id === referral?.jobId);
                    return (
                      <Card key={earning.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h4>{referral?.candidateName}</h4>
                            <p className="text-sm text-muted-foreground">{job?.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(earning.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">${earning.amount}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {userEarnings.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No earnings yet. Start referring candidates!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeView === 'password' && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="current">Current Password</Label>
                      <Input
                        id="current"
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit">Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Force password change dialog for first login */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                You must change your password before continuing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}