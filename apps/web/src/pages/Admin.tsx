/**
 * Admin Dashboard Page
 *
 * Production-grade admin dashboard with stunning visuals
 * Features stats, charts, activity feed, and data management tabs
 */

import { Shield, Users, BookOpen, RefreshCw, Bell, BarChart3, UsersRound } from 'lucide-react';
import { PageContainer } from '@repo/ui/components/page-container';
import { PageHeader } from '@repo/ui/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { AdminStats } from '../components/Admin/AdminStats';
import { AdminActivityFeed } from '../components/Admin/AdminActivityFeed';
import { AdminCharts } from '../components/Admin/AdminCharts';
import { AdminUsersTab } from '../components/Admin/AdminUsersTab';
import { AdminBooksTab } from '../components/Admin/AdminBooksTab';
import { AdminRequestsTab } from '../components/Admin/AdminRequestsTab';
import { AdminNotificationsTab } from '../components/Admin/AdminNotificationsTab';
import { AdminAnalyticsTab } from '../components/Admin/AdminAnalyticsTab';
import { AdminCommunitiesTab } from '../components/Admin/AdminCommunitiesTab';
import { useIsAdmin } from '../hooks/useAdminUser';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@repo/ui/components/loading-spinner';

export default function Admin() {
  const { isAdmin, isLoading } = useIsAdmin();

  // Show loading state while checking admin status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer>
      {/* Clean Header */}
      <div className="border-b border-border pb-8 mb-8">
        <PageHeader
          title="Admin Dashboard"
          description="Monitor and manage the BookShare platform"
          icon={Shield}
          className="mb-0"
        />
      </div>

        {/* Stats Cards */}
        <AdminStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Charts - 2 columns */}
          <div className="lg:col-span-2">
            <AdminCharts />
          </div>

          {/* Activity Feed - 1 column */}
          <div className="lg:col-span-1">
            <AdminActivityFeed />
          </div>
        </div>

        {/* Data Management Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="inline-flex w-auto gap-1 bg-transparent border-b border-border p-0 h-auto rounded-none">
            <TabsTrigger
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="books"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Books
            </TabsTrigger>
            <TabsTrigger
              value="communities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <UsersRound className="w-4 h-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 pt-3"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <AdminBooksTab />
          </TabsContent>

          <TabsContent value="communities" className="space-y-4">
            <AdminCommunitiesTab />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <AdminRequestsTab />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <AdminNotificationsTab />
          </TabsContent>
        </Tabs>
      </PageContainer>
  );
}
