'use client';

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type AdminStats = {
  totalUsers: number;
  totalStudents: number;
  totalWriters: number;
  totalAdmins: number;
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalVolume: number;
};

type UserItem = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "writer" | "admin";
  isActive: boolean;
  createdAt: string;
};

type OrderItem = {
  _id: string;
  title: string;
  subject: string;
  academicLevel: string;
  pages: number;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"users" | "orders">("users");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalWriters: 0,
    totalAdmins: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalVolume: 0,
  });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadAdminData() {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/orders"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: `User role successfully updated to ${newRole}!`, type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update user role.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error occurred.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleStatusToggle(userId: string, currentStatus: boolean) {
    setUpdatingId(userId);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setNotification({ text: `User ${!currentStatus ? "activated" : "suspended"}.`, type: "success" });
        await loadAdminData();
      }
    } catch {
      setNotification({ text: "Network error occurred.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleOrderStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: `Order status updated to ${newStatus}.`, type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update order status.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error occurred.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setUpdatingId(orderId);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification({ text: "Order deleted successfully.", type: "success" });
        await loadAdminData();
      }
    } catch {
      setNotification({ text: "Network error occurred.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = users.filter((u) => (roleFilter === "all" ? true : u.role === roleFilter));
  const filteredOrders = orders.filter((o) => (statusFilter === "all" ? true : o.status === statusFilter));

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-6 py-16 text-[#182329] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#d9ddda] pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-[#647176] hover:text-[#e8664d]">
                ← AcademicPro
              </Link>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#c94e39]">Admin portal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="mt-3 text-[#647176]">Monitor platform metrics, manage user roles, and supervise all assignment workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAdminData()}
              className="rounded-full border border-[#d9ddda] bg-white px-4 py-2.5 text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="rounded-full border border-[#d9ddda] bg-white px-5 py-2.5 text-sm font-semibold text-[#c94e39] transition hover:border-[#c94e39] hover:bg-[#fbfaf7]"
            >
              Sign out
            </button>
          </div>
        </div>

        {notification ? (
          <div
            className={`mt-6 border p-4 text-sm font-medium ${
              notification.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
            }`}
          >
            {notification.text}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.totalUsers}</p>
            <p className="mt-2 text-xs text-[#647176]">
              {stats.totalStudents} Students • {stats.totalWriters} Writers • {stats.totalAdmins} Admins
            </p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Total Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.totalOrders}</p>
            <p className="mt-2 text-xs text-[#647176]">
              {stats.pendingOrders} Pending • {stats.inProgressOrders} In Progress
            </p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Delivered Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.completedOrders}</p>
            <p className="mt-2 text-xs text-[#647176]">Submitted & approved</p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Platform Volume</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">
              {loading ? "..." : `$${stats.totalVolume.toLocaleString()}`}
            </p>
            <p className="mt-2 text-xs text-[#647176]">Cumulative assignment value</p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex border-b border-[#d9ddda]">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "users"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              Users Directory ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "orders"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              All Assignments ({orders.length})
            </button>
          </div>

          <div className="mt-8">
            {activeTab === "users" ? (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-sm text-[#647176]">
                    <span>Filter by role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border border-[#d9ddda] bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#e8664d]"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="writer">Writers</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                  <span className="text-xs text-[#647176]">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="overflow-x-auto border border-[#d9ddda] bg-[#fbfaf7]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#d9ddda] bg-[#f5f4f0] text-xs font-semibold uppercase tracking-wider text-[#647176]">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d9ddda]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#647176]">
                            No users found matching filter.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-white/60">
                            <td className="px-6 py-4 font-semibold text-[#182329]">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-4 text-[#39484d]">{user.email}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.role === "writer"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
                                  user.isActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              <span className="text-xs text-[#647176]">
                                {user.isActive ? "Active" : "Suspended"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#647176]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  disabled={updatingId === user._id}
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                  className="border border-[#d9ddda] bg-white px-2 py-1 text-xs outline-none focus:border-[#e8664d] disabled:opacity-50"
                                >
                                  <option value="student">Student</option>
                                  <option value="writer">Writer</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  type="button"
                                  disabled={updatingId === user._id}
                                  onClick={() => handleStatusToggle(user._id, user.isActive)}
                                  className={`rounded px-2.5 py-1 text-xs font-semibold border transition ${
                                    user.isActive
                                      ? "border-[#d9ddda] text-[#c94e39] hover:bg-rose-50"
                                      : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                  }`}
                                >
                                  {user.isActive ? "Suspend" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-sm text-[#647176]">
                    <span>Filter by status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-[#d9ddda] bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#e8664d]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <span className="text-xs text-[#647176]">{filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="overflow-x-auto border border-[#d9ddda] bg-[#fbfaf7]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#d9ddda] bg-[#f5f4f0] text-xs font-semibold uppercase tracking-wider text-[#647176]">
                      <tr>
                        <th className="px-6 py-4">Title & Subject</th>
                        <th className="px-6 py-4">Level / Pages</th>
                        <th className="px-6 py-4">Budget</th>
                        <th className="px-6 py-4">Deadline</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d9ddda]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#647176]">
                            No orders found matching filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-white/60">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-[#182329]">{order.title}</p>
                              <p className="text-xs text-[#647176]">{order.subject}</p>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#39484d]">
                              {order.academicLevel} • {order.pages} pg{order.pages > 1 ? "s" : ""}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#182329]">${order.budget}</td>
                            <td className="px-6 py-4 text-xs text-[#647176]">
                              {new Date(order.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                disabled={updatingId === order._id}
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                className="border border-[#d9ddda] bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#e8664d]"
                              >
                                <option value="pending">pending</option>
                                <option value="in_progress">in_progress</option>
                                <option value="submitted">submitted</option>
                                <option value="completed">completed</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}