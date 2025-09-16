import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { LogOut, User, Plus, FileText, Settings, Search, CheckCircle, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "./ui/api";

// Only accept user and onLogout props
export type HRDashboardProps = {
  user: any;
  onLogout: () => void;
};

export function HRDashboard({ user, onLogout }: HRDashboardProps) {
  const [activeView, setActiveView] = useState('profile');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(user.firstLogin);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [jobForm, setJobForm] = useState({ title: '', description: '', referralBonus: '' });
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [limitForm, setLimitForm] = useState({ employeeId: '', limit: '' });
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralLimits, setReferralLimits] = useState<{ [key: string]: number }>({});
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, jobsRes, referralsRes, earningsRes] = await Promise.all([
        api.getUsers(),
        api.getJobs(),
        api.getReferrals(),
        api.getEarnings ? api.getEarnings() : Promise.resolve([])
      ]);
      setUsers(usersRes);
      setJobs(jobsRes);
      setReferrals(referralsRes);
      setEarnings(earningsRes);
      if (api.getReferralLimits) {
        setReferralLimits(await api.getReferralLimits());
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const employees = users.filter((u: any) => u.role === 'Employee');
  const allReferrals = referrals;
  const filteredReferrals = searchTerm 
    ? allReferrals.filter((r: any) => {
        const employee = employees.find((e: any) => e.id === r.employeeId);
        return employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : allReferrals;

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createJob({
        title: jobForm.title,
        description: jobForm.description,
        referralBonus: parseInt(jobForm.referralBonus),
        createdBy: user.id
      });
      setJobForm({ title: '', description: '', referralBonus: '' });
      toast.success('Job posted successfully!');
      fetchAll();
    } catch {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const employee = employees.find((e: any) => e.id === parseInt(limitForm.employeeId));
    const currentUsed = referrals.filter((r: any) => r.employeeId === parseInt(limitForm.employeeId)).length;
    const newLimit = parseInt(limitForm.limit);
    if (newLimit < currentUsed) {
      toast.error(`Cannot set limit below ${currentUsed}. Employee has already made ${currentUsed} referrals.`);
      return;
    }
    try {
      setLoading(true);
      if (api.setReferralLimit) {
        await api.setReferralLimit(limitForm.employeeId, newLimit);
      }
      setLimitForm({ employeeId: '', limit: '' });
      toast.success(`Referral limit set to ${newLimit} for ${employee.name}`);
      fetchAll();
    } catch {
      toast.error('Failed to set referral limit');
    } finally {
      setLoading(false);
    }
  };

  // ...existing UI rendering code, using only users, jobs, referrals, referralLimits, earnings, etc...
  // (The rest of the file remains unchanged, but all data access should use the new state above)
}
