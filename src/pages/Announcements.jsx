import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Bell,
  PlusCircle,
  Check,
  CheckCheck,
  Calendar,
  User,
  Megaphone,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';

/* =========================
   UI ONLY PRESENTATION LAYER
   (NO BUSINESS LOGIC)
========================= */

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const TimelineDot = ({ active }) => (
  <div className={`h-3 w-3 rounded-full ${active ? "bg-brand-primary animate-pulse" : "bg-slate-600"}`} />
);

const PanelHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
      <Icon className="h-5 w-5 text-brand-primary" />
    </div>
    <div>
      <h2 className="font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  </div>
);

const FeedItem = ({ ann, onMarkRead }) => {
  const unread = !ann.isRead;

  return (
    <div className="relative pl-6">

      {/* Timeline dot (visual only) */}
      <div className="absolute left-0 top-3">
        <TimelineDot active={unread} />
      </div>

      <GlassCard className={`p-5 transition-all ${
        unread
          ? "border-brand-primary/30 shadow-lg shadow-brand-primary/10"
          : "opacity-80"
      }`}>

        {/* TITLE ROW */}
        <div className="flex justify-between gap-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className={`h-4 w-4 ${unread ? "text-brand-primary" : "text-slate-500"}`} />
            {ann.title}
          </h3>

          {unread && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              NEW
            </span>
          )}
        </div>

        {/* META */}
        <div className="mt-2 text-[10px] text-slate-500 flex gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {ann.createdBy?.name || 'Admin'}
          </span>

          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(ann.createdAt).toLocaleString()}
          </span>
        </div>

        {/* CONTENT */}
        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
          {ann.content}
        </p>

        {/* ACTION */}
        {unread && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onMarkRead(ann.id)}
              className="text-[10px] px-3 py-1 rounded-lg
                         bg-brand-primary/10 border border-brand-primary/20
                         text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              Mark as read
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

/* =========================
   MAIN COMPONENT (UNCHANGED LOGIC)
========================= */

export const Announcements = () => {
  const {
    user,
    announcements,
    fetchAnnouncements,
    postAnnouncement,
    markAnnouncementAsRead,
    markAllAnnouncementsAsRead
  } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const refreshAnnouncements = async () => {
    setLoading(true);
    try {
      await fetchAnnouncements();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Please specify both title and content.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await postAnnouncement(title, content);
      setTitle('');
      setContent('');
      setSuccess('Announcement published successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markAnnouncementAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAnnouncementsAsRead();
    setSuccess('All announcements marked as read.');
    setTimeout(() => setSuccess(''), 2000);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-brand-primary" />
            Corporate Announcements Hub
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Central communication system for internal broadcasts and HR updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {announcements.some(a => !a.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold"
            >
              <CheckCheck className="inline h-4 w-4 mr-2 text-brand-primary" />
              Mark All Read
            </button>
          )}

          <div className="text-[10px] text-slate-400">
            {announcements.length} broadcasts
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ADMIN PANEL */}
        {isAdmin && (
          <div className="xl:col-span-4">
            <GlassCard className="sticky top-6 p-6">

              <PanelHeader
                icon={PlusCircle}
                title="Broadcast Control Center"
                subtitle="Publish internal announcements"
              />

              <form onSubmit={handlePost} className="space-y-4">

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  placeholder="Title"
                />

                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-slate-200 resize-none"
                  placeholder="Content"
                />

                <button
                  disabled={actionLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase
                             bg-gradient-to-r from-brand-primary to-orange-500"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Publish Broadcast'
                  )}
                </button>

              </form>
            </GlassCard>
          </div>
        )}

        {/* FEED */}
        <div className={isAdmin ? "xl:col-span-8 space-y-6" : "xl:col-span-12 space-y-6"}>

          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-primary" />
            <h2 className="font-bold">Live Broadcast Feed</h2>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="space-y-5 border-l border-white/10 pl-6">

              {announcements.map((ann) => (
                <FeedItem
                  key={ann.id}
                  ann={ann}
                  onMarkRead={handleMarkRead}
                />
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};