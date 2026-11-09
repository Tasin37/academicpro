'use client';

import { useEffect, useState, useRef } from "react";
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

type BlogItem = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImage?: string;
  readTime: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
};

type FAQItem = {
  _id: string;
  question: string;
  answer: string;
  isPublished: boolean;
};

const BLOG_CATEGORIES = [
  "Academic Writing",
  "Formatting & Style",
  "Study Skills",
  "Research",
  "Thesis & Dissertation",
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "blogs" | "faqs">("users");
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
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Blog publishing form state
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Academic Writing");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [blogIsPublished, setBlogIsPublished] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishingBlog, setIsPublishingBlog] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqIsPublished, setFaqIsPublished] = useState(true);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqQuestion, setEditingFaqQuestion] = useState("");
  const [editingFaqAnswer, setEditingFaqAnswer] = useState("");

  async function loadAdminData() {
    try {
      const [statsRes, usersRes, ordersRes, blogsRes, faqsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/orders"),
        fetch("/api/blogs?all=true"),
        fetch("/api/faqs?all=true"),
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
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.posts || []);
      }
      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData.faqs || []);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    Promise.all([
      fetch("/api/admin/stats").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/users").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/orders").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/blogs?all=true").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/faqs?all=true").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([statsData, usersData, ordersData, blogsData, faqsData]) => {
        if (!isActive) return;
        if (statsData?.stats) setStats(statsData.stats);
        if (usersData?.users) setUsers(usersData.users);
        if (ordersData?.orders) setOrders(ordersData.orders);
        if (blogsData?.posts) setBlogs(blogsData.posts);
        if (faqsData?.faqs) setFaqs(faqsData.faqs);
      })
      .catch((err) => console.error("Failed to load admin dashboard:", err))
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
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
        setNotification({ text: `User role successfully updated to ${newRole}.`, type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update role.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    setUpdatingId(userId);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          text: `User account ${!currentStatus ? "activated" : "suspended"}.`,
          type: "success",
        });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update user status.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error. Please try again.", type: "error" });
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
      setNotification({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    setUpdatingId(orderId);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: "Order deleted successfully.", type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to delete order.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Cover image upload
  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", files[0]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as { urls: string[] };
        if (data.urls && data.urls[0]) {
          setBlogCoverImage(data.urls[0]);
          setNotification({ text: "Cover image uploaded successfully!", type: "success" });
        }
      } else {
        setNotification({ text: "Failed to upload cover image.", type: "error" });
      }
    } catch {
      setNotification({ text: "Error uploading image.", type: "error" });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleCreateFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setNotification({ text: "Question and answer are required.", type: "error" });
      return;
    }

    setIsSavingFaq(true);
    setNotification(null);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          isPublished: faqIsPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification({ text: data.error || "Failed to create FAQ.", type: "error" });
        return;
      }
      setFaqQuestion("");
      setFaqAnswer("");
      setFaqIsPublished(true);
      setNotification({ text: "FAQ created successfully.", type: "success" });
      await loadAdminData();
    } catch {
      setNotification({ text: "Network error while creating FAQ.", type: "error" });
    } finally {
      setIsSavingFaq(false);
    }
  }

  async function handleFaqUpdate(id: string, changes: { question?: string; answer?: string; isPublished?: boolean }) {
    setUpdatingId(id);
    setNotification(null);
    try {
      const res = await fetch("/api/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: "FAQ updated successfully.", type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update FAQ.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error while updating FAQ.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteFaq(id: string) {
    if (!window.confirm("Delete this FAQ? This action cannot be undone.")) return;
    setUpdatingId(id);
    setNotification(null);
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: "FAQ deleted successfully.", type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to delete FAQ.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error while deleting FAQ.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Publish new blog post
  async function handleCreateBlog(e: React.FormEvent) {
    e.preventDefault();
    if (!blogTitle.trim() || !blogSummary.trim() || !blogContent.trim()) {
      setNotification({ text: "Title, summary, and content are required.", type: "error" });
      return;
    }

    setIsPublishingBlog(true);
    setNotification(null);

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogTitle.trim(),
          category: blogCategory.trim(),
          summary: blogSummary.trim(),
          content: blogContent.trim(),
          coverImage: blogCoverImage.trim(),
          isPublished: blogIsPublished,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ text: "Blog post published successfully!", type: "success" });
        setBlogTitle("");
        setBlogSummary("");
        setBlogContent("");
        setBlogCoverImage("");
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to publish blog post.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error while publishing post.", type: "error" });
    } finally {
      setIsPublishingBlog(false);
    }
  }

  // Toggle blog post visibility
  async function handleToggleBlogPublish(slug: string, currentStatus: boolean) {
    setUpdatingId(slug);
    setNotification(null);
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          text: `Blog post ${!currentStatus ? "published" : "set to draft"}.`,
          type: "success",
        });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to update blog post.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete blog post
  async function handleDeleteBlog(slug: string) {
    if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return;
    }
    setUpdatingId(slug);
    setNotification(null);
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ text: "Blog post deleted successfully.", type: "success" });
        await loadAdminData();
      } else {
        setNotification({ text: data.error || "Failed to delete post.", type: "error" });
      }
    } catch {
      setNotification({ text: "Network error. Please try again.", type: "error" });
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
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#c94e39]">Admin Portal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Platform Administration</h1>
            <p className="mt-3 text-[#647176]">Manage platform users, oversee assignments, and publish blog articles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadAdminData()}
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
            className={`mt-6 rounded-xl border p-4 text-sm font-medium ${
              notification.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
            }`}
          >
            {notification.text}
          </div>
        ) : null}

        {/* Analytics Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Total Users</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.totalUsers}</p>
            <p className="mt-2 text-xs text-[#647176]">
              {stats.totalStudents} Students • {stats.totalWriters} Writers • {stats.totalAdmins} Admins
            </p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Total Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.totalOrders}</p>
            <p className="mt-2 text-xs text-[#647176]">
              {stats.pendingOrders} Pending • {stats.inProgressOrders} In Progress
            </p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Delivered Orders</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.completedOrders}</p>
            <p className="mt-2 text-xs text-[#647176]">Submitted & approved</p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Blog Articles</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">
              {loading ? "..." : blogs.length}
            </p>
            <p className="mt-2 text-xs text-[#647176]">Published guides & insights</p>
          </div>
        </div>

        {/* Tabs Navigation */}
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
            <button
              type="button"
              onClick={() => setActiveTab("blogs")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "blogs"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              Blog Management ({blogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "faqs"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              FAQ Management ({faqs.length})
            </button>
          </div>

          <div className="mt-8">
            {/* Users Tab */}
            {activeTab === "users" ? (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-sm text-[#647176]">
                    <span>Filter by role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="rounded-lg border border-[#d9ddda] bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#e8664d]"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="writer">Writer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <span className="text-xs text-[#647176]">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#d9ddda] bg-[#fbfaf7]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#d9ddda] bg-[#f5f4f0] text-xs font-semibold uppercase tracking-wider text-[#647176]">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Account Status</th>
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
                            <td className="px-6 py-4 text-xs text-[#647176]">{user.email}</td>
                            <td className="px-6 py-4">
                              <select
                                disabled={updatingId === user._id}
                                value={user.role}
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                className="rounded border border-[#d9ddda] bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#e8664d]"
                              >
                                <option value="student">student</option>
                                <option value="writer">writer</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  user.isActive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {user.isActive ? "Active" : "Suspended"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#647176]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                disabled={updatingId === user._id}
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                className={`text-xs font-semibold transition ${
                                  user.isActive
                                    ? "text-rose-600 hover:text-rose-800"
                                    : "text-emerald-600 hover:text-emerald-800"
                                }`}
                              >
                                {user.isActive ? "Suspend" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Orders Tab */}
            {activeTab === "orders" ? (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-sm text-[#647176]">
                    <span>Filter by status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-[#d9ddda] bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#e8664d]"
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

                <div className="overflow-x-auto rounded-2xl border border-[#d9ddda] bg-[#fbfaf7]">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#d9ddda] bg-[#f5f4f0] text-xs font-semibold uppercase tracking-wider text-[#647176]">
                      <tr>
                        <th className="px-6 py-4">Title & Subject</th>
                        <th className="px-6 py-4">Level / Pages</th>
                        <th className="px-6 py-4">Deadline</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d9ddda]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#647176]">
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
                            <td className="px-6 py-4 text-xs text-[#647176]">
                              {new Date(order.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                disabled={updatingId === order._id}
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                className="rounded border border-[#d9ddda] bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#e8664d]"
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
            ) : null}

            {/* Blogs Tab */}
            {activeTab === "blogs" ? (
              <div className="space-y-10">
                {/* Publish Blog Form Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-[#182329]">Publish a New Blog Article</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Write and publish academic guides, writing tips, or study advice directly to the public blog.
                    </p>
                  </div>

                  <form onSubmit={handleCreateBlog} className="mt-6 space-y-6">
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          ARTICLE TITLE
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. How to Write a Comprehensive Dissertation Proposal"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          className="h-11 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          CATEGORY
                        </label>
                        <select
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          className="h-11 w-full rounded-xl bg-[#f1f4f6] px-3 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                        >
                          {BLOG_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        EXCERPT / SUMMARY
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="A concise 1-2 sentence overview displayed on article cards and search results..."
                        value={blogSummary}
                        onChange={(e) => setBlogSummary(e.target.value)}
                        className="w-full rounded-xl bg-[#f1f4f6] p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        ARTICLE CONTENT (SUPPORTS ### HEADINGS, - BULLETS, AND &gt; QUOTES)
                      </label>
                      <textarea
                        required
                        rows={10}
                        placeholder="Write your article body here. Use paragraphs, ### Subheadings, and - bullet lists for clean formatting..."
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="w-full rounded-xl bg-[#f1f4f6] p-4 font-mono text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                      />
                    </div>

                    {/* Cover image input & upload */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        COVER IMAGE (OPTIONAL)
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                          type="url"
                          placeholder="Paste image URL (e.g. https://.../photo.jpg) or click Upload Image"
                          value={blogCoverImage}
                          onChange={(e) => {
                            setBlogCoverImage(e.target.value);
                            setImagePreviewError(false);
                          }}
                          className="h-11 flex-1 rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                        />
                        <button
                          type="button"
                          onClick={() => coverImageInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          {isUploadingImage ? "Uploading..." : "📷 Upload Image"}
                        </button>
                        <input
                          ref={coverImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverImageUpload}
                        />
                      </div>

                      {blogCoverImage ? (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] p-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-700">Cover Image Preview</span>
                            <button
                              type="button"
                              onClick={() => {
                                setBlogCoverImage("");
                                setImagePreviewError(false);
                              }}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                            >
                              ✕ Remove
                            </button>
                          </div>

                          {imagePreviewError ? (
                            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                              <p className="font-bold">⚠️ Could not load image from this URL</p>
                              <p className="mt-1">
                                Webpage links (e.g. <code>https://website.com/article</code>) are HTML articles, not image files.
                                Please provide a direct image link (ending in <code>.jpg</code>, <code>.png</code>, <code>.webp</code>) or click <strong>📷 Upload Image</strong> to select an image from your device.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={blogCoverImage}
                                alt="Cover preview"
                                onError={() => setImagePreviewError(true)}
                                className="max-h-48 w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ) : null}

                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blogIsPublished}
                          onChange={(e) => setBlogIsPublished(e.target.checked)}
                          className="h-4 w-4 rounded text-[#416169] focus:ring-[#416169]"
                        />
                        Publish immediately to live blog
                      </label>

                      <button
                        type="submit"
                        disabled={isPublishingBlog}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#416169] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#324d54] disabled:opacity-60"
                      >
                        {isPublishingBlog ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Publishing...
                          </>
                        ) : (
                          "Publish Article"
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Articles Table */}
                <div className="rounded-3xl border border-[#d9ddda] bg-white p-6 shadow-xs sm:p-8">
                  <div className="flex items-center justify-between border-b border-[#d9ddda] pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#182329]">All Articles ({blogs.length})</h3>
                      <p className="text-xs text-[#647176]">Manage live articles, view counts, and drafts</p>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#d9ddda] bg-[#f5f4f0] text-xs font-semibold uppercase tracking-wider text-[#647176]">
                        <tr>
                          <th className="px-6 py-4">Article</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Views</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d9ddda]">
                        {blogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-[#647176]">
                              No blog articles found.
                            </td>
                          </tr>
                        ) : (
                          blogs.map((article) => (
                            <tr key={article._id} className="hover:bg-slate-50/60">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-[#182329]">{article.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{article.summary}</p>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                                {article.category}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    article.isPublished
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {article.isPublished ? "Published" : "Draft"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-600">
                                {article.views || 0}
                              </td>
                              <td className="px-6 py-4 text-xs text-[#647176]">
                                {new Date(article.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-xs">
                                  <Link
                                    href={`/blog/${article.slug}`}
                                    target="_blank"
                                    className="font-bold text-[#416169] hover:underline"
                                  >
                                    View ↗
                                  </Link>
                                  <button
                                    type="button"
                                    disabled={updatingId === article.slug}
                                    onClick={() => handleToggleBlogPublish(article.slug, article.isPublished)}
                                    className="font-semibold text-slate-600 hover:text-slate-900"
                                  >
                                    {article.isPublished ? "Unpublish" : "Publish"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingId === article.slug}
                                    onClick={() => handleDeleteBlog(article.slug)}
                                    className="font-semibold text-rose-600 hover:text-rose-800"
                                  >
                                    Delete
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
              </div>
            ) : null}

            {activeTab === "faqs" ? (
              <div className="space-y-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                  <h2 className="text-xl font-bold text-[#182329]">Add a FAQ</h2>
                  <p className="mt-1 text-xs text-slate-500">Create questions and answers shown in the public FAQ section.</p>
                  <form onSubmit={handleCreateFaq} className="mt-6 space-y-4">
                    <input
                      required
                      placeholder="Question"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="h-11 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#416169]/25"
                    />
                    <textarea
                      required
                      rows={4}
                      placeholder="Answer"
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      className="w-full rounded-xl bg-[#f1f4f6] p-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#416169]/25"
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input type="checkbox" checked={faqIsPublished} onChange={(e) => setFaqIsPublished(e.target.checked)} />
                      Publish immediately
                    </label>
                    <button
                      type="submit"
                      disabled={isSavingFaq}
                      className="rounded-xl bg-[#416169] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#324d54] disabled:opacity-60"
                    >
                      {isSavingFaq ? "Saving..." : "Add FAQ"}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          {editingFaqId === faq._id ? (
                            <div className="space-y-3">
                              <input
                                value={editingFaqQuestion}
                                onChange={(e) => setEditingFaqQuestion(e.target.value)}
                                className="h-10 w-full rounded-lg bg-[#f1f4f6] px-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#416169]/25"
                              />
                              <textarea
                                rows={3}
                                value={editingFaqAnswer}
                                onChange={(e) => setEditingFaqAnswer(e.target.value)}
                                className="w-full rounded-lg bg-[#f1f4f6] p-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#416169]/25"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={updatingId === faq._id}
                                  onClick={async () => {
                                    await handleFaqUpdate(faq._id, {
                                      question: editingFaqQuestion.trim(),
                                      answer: editingFaqAnswer.trim(),
                                    });
                                    setEditingFaqId(null);
                                  }}
                                  className="rounded-lg bg-[#416169] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFaqId(null)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-[#182329]">{faq.question}</h3>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                            </>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            disabled={updatingId === faq._id}
                            onClick={() => {
                              setEditingFaqId(faq._id);
                              setEditingFaqQuestion(faq.question);
                              setEditingFaqAnswer(faq.answer);
                            }}
                            className="text-xs font-semibold text-[#416169] hover:text-[#324d54]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === faq._id}
                            onClick={() => handleFaqUpdate(faq._id, { isPublished: !faq.isPublished })}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                              faq.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {faq.isPublished ? "Published" : "Hidden"}
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === faq._id}
                            onClick={() => handleDeleteFaq(faq._id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {faqs.length === 0 ? <p className="text-sm text-slate-500">No FAQs have been created yet.</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
