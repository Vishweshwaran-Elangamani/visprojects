// Real API for backend integration
const API_BASE = "http://localhost:5019/api"; // Changed port to match backend

export const api = {
	// Change password for employee
	changeEmployeePassword: async (employeeId: number, oldPassword: string, newPassword: string, confirmNewPassword: string) => {
		const res = await fetch(`${API_BASE}/employee/change-password?employeeId=${employeeId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ OldPassword: oldPassword, NewPassword: newPassword, ConfirmNewPassword: confirmNewPassword })
		});
		if (!res.ok) throw new Error("Failed to change password");
		return await res.json();
	},
	// Change password for HR
	changeHRPassword: async (userId: number, oldPassword: string, newPassword: string, confirmNewPassword: string) => {
		const res = await fetch(`${API_BASE}/hr/change-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ UserId: userId, OldPassword: oldPassword, NewPassword: newPassword, ConfirmNewPassword: confirmNewPassword })
		});
		if (!res.ok) throw new Error("Failed to change password");
		return await res.json();
	},
	// Change password for auth
	changeAuthPassword: async (email: string, oldPassword: string, newPassword: string, confirmNewPassword: string) => {
		const res = await fetch(`${API_BASE}/auth/change-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ Email: email, OldPassword: oldPassword, NewPassword: newPassword, ConfirmNewPassword: confirmNewPassword })
		});
		if (!res.ok) throw new Error("Failed to change password");
		return await res.json();
	},
		getJobs: async () => {
			const res = await fetch(`${API_BASE}/hr/jobs`);
			if (!res.ok) throw new Error("Failed to fetch jobs");
			return await res.json();
		},
	login: async (email: string, password: string) => {
		const res = await fetch(`${API_BASE}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password })
		});
		if (!res.ok) throw new Error("Invalid credentials");
		return await res.json();
	},
	createUser: async (user: any) => {
		const res = await fetch(`${API_BASE}/admin/create-user`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(user)
		});
		if (!res.ok) throw new Error("Failed to create user");
		return await res.json();
	},
	getUsers: async () => {
		const res = await fetch(`${API_BASE}/admin/users`);
		if (!res.ok) throw new Error("Failed to fetch users");
		return await res.json();
	},
	// Delete user by id
	deleteUser: async (userId: number) => {
		const res = await fetch(`${API_BASE}/admin/delete-user/${userId}`, {
			method: "DELETE"
		});
		if (!res.ok) throw new Error("Failed to delete user");
		return await res.json();
	},
	getReferrals: async () => {
		const res = await fetch(`${API_BASE}/referral-management/referrals`);
		if (!res.ok) throw new Error("Failed to fetch referrals");
		return await res.json();
	},
	getReferralLimits: async () => {
		const res = await fetch(`${API_BASE}/hr/referral-limits`);
		if (!res.ok) throw new Error("Failed to fetch referral limits");
		return await res.json();
	},
	createJob: async (job: any) => {
		const res = await fetch(`${API_BASE}/hr/add-job`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(job)
		});
		if (!res.ok) throw new Error("Failed to create job");
		return await res.json();
	},
	setReferralLimit: async (employeeId: string, limit: number) => {
		const res = await fetch(`${API_BASE}/hr/set-referral-limit`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ employeeId: parseInt(employeeId), limitCount: limit })
		});
		if (!res.ok) throw new Error("Failed to set referral limit");
		return await res.json();
	},
	deleteJob: async (jobId: number) => {
		const res = await fetch(`${API_BASE}/hr/delete-job/${jobId}`, {
			method: "DELETE"
		});
		if (!res.ok) throw new Error("Failed to delete job");
			return await res.json();
		},
		updateReferralStatus: async (referralId: number, newStatus: string, interviewDateTime?: string) => {
		const res = await fetch(`${API_BASE}/hr/update-referral-status`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				ReferralId: referralId,
				NewStatus: newStatus,
				InterviewDateTime: interviewDateTime || null
			})
		});
		if (!res.ok) throw new Error("Failed to update referral status");
		return await res.json();
	},
	getEmployeeEarnings: async (employeeId: number) => {
		const res = await fetch(`${API_BASE}/employee/earnings?employeeId=${employeeId}`);
		if (!res.ok) throw new Error("Failed to fetch employee earnings");
		return await res.json();
	},
};
