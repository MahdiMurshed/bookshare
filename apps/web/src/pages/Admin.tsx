/**
 * Admin Dashboard Page
 *
 * Production-grade admin dashboard with stunning visuals
 * Features stats, charts, activity feed, and data management tabs
 */

import { Shield, Users, BookOpen, RefreshCw } from 'lucide-react';
import { PageContainer } from '@repo/ui/components/page-container';
import { PageHeader } from '@repo/ui/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { AdminStats } from '../components/Admin/AdminStats';
import { AdminActivityFeed } from '../components/Admin/AdminActivityFeed';
import { AdminCharts } from '../components/Admin/AdminCharts';
import { AdminUsersTab } from '../components/Admin/AdminUsersTab';
import { AdminBooksTab } from '../components/Admin/AdminBooksTab';
import { AdminRequestsTab } from '../components/Admin/AdminRequestsTab';
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
    <>
      {/* Add custom styles for the page */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .admin-header-gradient {
          background: linear-gradient(
            135deg,
            rgba(251, 146, 60, 0.1) 0%,
            rgba(249, 115, 22, 0.1) 50%,
            rgba(234, 88, 12, 0.1) 100%
          );
          border-bottom: 1px solid rgba(251, 146, 60, 0.2);
        }

        .tab-trigger-active {
          background: linear-gradient(to right, #f97316, #ea580c);
          color: white;
          font-weight: 600;
        }
      `}</style>

      <PageContainer>
        {/* Enhanced Header */}
        <div className="admin-header-gradient -mx-6 -mt-6 px-6 pt-6 pb-8 mb-8 rounded-b-2xl">
          <PageHeader
            title="Admin Dashboard"
            description="Monitor and manage the BookShare platform"
            icon={Shield}
            className="mb-0"
          />

          {/* Welcome message with gradient text */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            <p className="text-sm text-muted-foreground font-medium">
              Welcome to the control center
            </p>
          </div>
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="inline-flex w-auto gap-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="users"
              className="data-[state=active]:tab-trigger-active transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="books"
              className="data-[state=active]:tab-trigger-active transition-all duration-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Books
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:tab-trigger-active transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <AdminBooksTab />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <AdminRequestsTab />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}
