import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { ChallengesPage } from '@/pages/ChallengesPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminChallengesPage } from '@/pages/admin/AdminChallengesPage'
import { AppLayout } from '@/components/layout/AppLayout'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/arena",
    element: <AppLayout container><ChallengesPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/leaderboard",
    element: <AppLayout container><LeaderboardPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/users",
    element: <AppLayout container><AdminUsersPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin/challenges",
    element: <AppLayout container><AdminChallengesPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)