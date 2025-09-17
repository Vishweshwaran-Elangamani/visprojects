import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  LogOut,
  User,
  Plus,
  FileText,
  Settings,
  Search,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "./ui/api";

export type HRDashboardProps = {
  user: any;
  onLogout: () => void;
  onUserUpdate: (user: any) => void;
  jobs: any[];
  setJobs: (jobs: any[]) => void;
  referrals: any[];
  setReferrals: (referrals: any[]) => void;
  users: any[];
  setUsers: (users: any[]) => void;
  referralLimits: { [key: string]: number };
  setReferralLimits: (limits: { [key: string]: number }) => void;
  refreshJobs: () => void;
  refreshReferrals: () => void;
  refreshUsers: () => void;
  refreshReferralLimits: () => void;
};

export function HRDashboard({ user, onLogout, onUserUpdate, jobs, setJobs, referrals, setReferrals, users, setUsers, referralLimits, setReferralLimits, refreshJobs, refreshReferrals, refreshUsers, refreshReferralLimits }: HRDashboardProps) {
  const [activeView, setActiveView] = useState("profile");
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
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [jobForm, setJobForm] = useState({ title: "", description: "", referralBonus: "" });
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [limitForm, setLimitForm] = useState({ employeeId: "", limit: "" });
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, referralsRes] = await Promise.all([
        api.getUsers(),
        api.getReferrals(),
      ]);
      setUsers(usersRes);
      setReferrals(referralsRes);
      setReferralLimits(await api.getReferralLimits());
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const employees = users.filter((u: any) => u.role === "Employee");
  const filteredReferrals = searchTerm
    ? referrals.filter((r: any) => {
        const employee = employees.find((e: any) => e.id === r.employeeId);
        return employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : referrals;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "interviewed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canProgressTo = (currentStatus: string, targetStatus: string) => {
    // Match backend status values exactly
    const statusOrder = ["Pending", "Verified", "Interview Scheduled", "Confirmed", "Rejected"];
    const currentIndex = statusOrder.indexOf((currentStatus || "Pending"));
    let targetMap: { [key: string]: string } = {
      verified: "Verified",
      interviewed: "Interview Scheduled",
      confirmed: "Confirmed"
    };
    const mappedTarget = targetMap[targetStatus.toLowerCase()] || targetStatus;
    const targetIndex = statusOrder.indexOf(mappedTarget);
    return targetIndex === currentIndex + 1;
  };

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        referralBonus: parseInt(jobForm.referralBonus),
        CreatedBy: user?.id ?? 4 // fallback to demo HR user if user.id is missing
      };
      await api.createJob(payload);
      setJobForm({ title: "", description: "", referralBonus: "" });
      toast.success("Job posted successfully!");
      await refreshJobs();
    } catch {
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const employee = employees.find((e: any) => e.id === parseInt(limitForm.employeeId));
    const currentUsed = referrals.filter(
      (r: any) => r.employeeId === parseInt(limitForm.employeeId)
    ).length;
    const newLimit = parseInt(limitForm.limit);
    if (newLimit < currentUsed) {
      toast.error(
        `Cannot set limit below ${currentUsed}. Employee has already made ${currentUsed} referrals.`
      );
      return;
    }
    try {
      setLoading(true);
      await api.setReferralLimit(limitForm.employeeId, newLimit);
      setLimitForm({ employeeId: "", limit: "" });
      toast.success(`Referral limit set to ${newLimit} for ${employee.name}`);
      // Always refresh limits after setting
      await refreshReferralLimits();
    } catch {
      toast.error("Failed to set referral limit");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (referralId: number, newStatus: string) => {
    try {
      setLoading(true);
      let interviewDT = undefined;
      if (newStatus === "interviewed" && interviewDateTime) {
        interviewDT = interviewDateTime;
      }
      await api.updateReferralStatus(referralId, newStatus, interviewDT);
      toast.success(`Status updated to ${newStatus}`);
      setSelectedReferral(null);
      setInterviewDateTime("");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await api.changePassword(user.id, passwordForm.current, passwordForm.new);
      const updatedUser = { ...user, password: passwordForm.new, firstLogin: false };
      onUserUpdate(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success("Password updated successfully!");
      setPasswordForm({ current: "", new: "", confirm: "" });
      setIsPasswordDialogOpen(false);
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2>HR Portal</h2>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "jobs", label: "Add Job", icon: Plus },
                { id: "referrals", label: "Referral Forms", icon: FileText },
                { id: "limits", label: "Set Limits", icon: Settings },
              ].map((item) => (
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
            <Button variant="outline" onClick={handleLogoutWrapper} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main */}
        <main className="flex-1">
          <header className="border-b bg-card p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1>
                {["Profile", "Add Job", "Referral Forms", "Set Limits"][
                  ["profile", "jobs", "referrals", "limits"].indexOf(activeView)
                ]}
              </h1>
            </div>
          </header>

          <div className="p-6">
            {/* Profile */}
            {activeView === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><p>{user.name}</p></div>
                    <div><Label>Role</Label><p>{user.role}</p></div>
                    <div><Label>Project</Label><p>{user.project}</p></div>
                    <div><Label>Place of Work</Label><p>{user.workplace}</p></div>
                    <div><Label>Designation</Label><p>{user.designation}</p></div>
                    <div><Label>Email</Label><p>{user.email}</p></div>
                  </div>
                  <Button onClick={() => setActiveView("password")}>Change Password</Button>
                </CardContent>
              </Card>
            )}

            {/* Jobs */}
            {activeView === "jobs" && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Job</CardTitle>
                    <CardDescription>Post a new job opening for employee referrals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="jobDescription">Job Description</Label>
                        <Textarea
                          id="jobDescription"
                          value={jobForm.description}
                          onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="referralBonus">Referral Bonus Amount ($)</Label>
                        <Input
                          id="referralBonus"
                          type="number"
                          value={jobForm.referralBonus}
                          onChange={(e) => setJobForm({ ...jobForm, referralBonus: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit">Post Job</Button>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>All Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobs.length === 0 && <p className="text-muted-foreground">No jobs posted yet.</p>}
                      {jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between border p-3 rounded">
                          <div>
                            <div className="font-semibold">{job.title}</div>
                            <div className="text-sm text-muted-foreground">{job.description}</div>
                            <div className="text-xs text-muted-foreground">Bonus: ${job.referralBonus}</div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this job?')) {
                                try {
                                  await api.deleteJob(job.id);
                                  toast.success('Job deleted successfully');
                                  refreshJobs();
                                } catch {
                                  toast.error('Failed to delete job');
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Referrals */}
            {activeView === "referrals" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredReferrals.map((referral: any) => {
                    const employee = users.find((e: any) => e.id === referral.employeeId);
                    const job = jobs.find((j: any) => j.id === referral.jobId);
                    return (
                      <Card key={referral.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{referral.candidateName}</CardTitle>
                            <Badge className={getStatusColor(referral.status)}>
                              {referral.status || "Pending"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Referred by {employee?.name} for {job?.title}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Company:</strong> {referral.currentCompany}</p>
                            <p><strong>Email:</strong> {referral.candidateEmail}</p>
                            <p><strong>Resume:</strong> {referral.resumePdf || referral.resume}</p>
                            {referral.resumePdf && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  fetch(`http://localhost:5019/api/employee/referral-pdf/${referral.id}`)
                                    .then(res => res.blob())
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = referral.resumePdf || 'resume.pdf';
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                    });
                                }}
                              >Download PDF</Button>
                            )}
                            {referral.interviewDateTime && (
                              <p><strong>Interview:</strong> {new Date(referral.interviewDateTime).toLocaleString()}</p>
                            )}
                            <p><strong>Submitted:</strong> {
                              (() => {
                                const d = new Date(referral.submittedAt);
                                return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
                              })()
                            }</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => setSelectedReferral(referral)}
                              disabled={referral.status === "confirmed"}
                            >
                              Manage Status
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredReferrals.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No referrals found matching your search."
                            : "No referrals received yet."}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Referral Status Dialog */}
            {selectedReferral && (
              <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Referral Status</DialogTitle>
                    <DialogDescription>
                      Update the status for {selectedReferral.candidateName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Status:</span>
                      <Badge className={getStatusColor(selectedReferral.status)}>
                        {selectedReferral.status || "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {canProgressTo(selectedReferral.status, "verified") && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedReferral.id, "Verified")}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Verified
                        </Button>
                      )}
                      {canProgressTo(selectedReferral.status, "interviewed") && (
                        <div className="space-y-2">
                          <Label htmlFor="interviewDateTime">Interview Date & Time</Label>
                          <Input
                            id="interviewDateTime"
                            type="datetime-local"
                            value={interviewDateTime}
                            onChange={(e) => setInterviewDateTime(e.target.value)}
                            required
                          />
                          <Button
                            onClick={() => handleStatusUpdate(selectedReferral.id, "Interview Scheduled")}
                            className="w-full"
                            disabled={!interviewDateTime}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                          </Button>
                        </div>
                      )}
                      {canProgressTo(selectedReferral.status, "confirmed") && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedReferral.id, "Confirmed")}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Candidate
                        </Button>
                      )}
                      {selectedReferral.status !== "Confirmed" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusUpdate(selectedReferral.id, "Rejected")}
                          className="w-full"
                        >
                          Cancel Application
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Limits */}
            {activeView === "limits" && (
              <Card>
                <CardHeader>
                  <CardTitle>Set Employee Referral Limits</CardTitle>
                  <CardDescription>Manage how many referrals each employee can make</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSetLimit} className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Employee</Label>
                      <select
                        id="employee"
                        value={limitForm.employeeId}
                        onChange={(e) => setLimitForm({ ...limitForm, employeeId: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Employee</option>
                        {users
                          .filter((u: any) => u.role === "Employee")
                          .map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="limit">Referral Limit</Label>
                      <Input
                        id="limit"
                        type="number"
                        min="1"
                        value={limitForm.limit}
                        onChange={(e) => setLimitForm({ ...limitForm, limit: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit">Set Limit</Button>
                  </form>

                  <div className="space-y-4">
                    <h3>Current Limits</h3>
                    {users
                      .filter((u: any) => u.role === "Employee")
                      .map((emp: any) => {
                        // Always use backend value, never fallback to 5 if set
                        const currentLimit = referralLimits[emp.id] ?? 5;
                        const usedCount = referrals.filter((r: any) => r.employeeId === emp.id).length;
                        return (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h4>{emp.name}</h4>
                              <p className="text-sm text-muted-foreground">{emp.designation}</p>
                            </div>
                            <div className="text-right">
                              <p>{usedCount}/{currentLimit} referrals</p>
                              <p className="text-xs text-muted-foreground">
                                {currentLimit - usedCount} remaining
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    {users.filter((u: any) => u.role === "Employee").length === 0 && (
                      <p className="text-muted-foreground">No employees found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Change Password */}
            {activeView === "password" && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {!user.firstLogin && (
                      <div>
                        <Label htmlFor="current">Current Password</Label>
                        <Input
                          id="current"
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
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
      </div>

      {/* Force password change dialog for first login */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>You must change your password before continuing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
