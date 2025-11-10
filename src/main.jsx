import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IntercomProvider } from "react-use-intercom";
import PrivateRoute from "./components/PrivateRoute";

import "./index.css";
import "./app.css";
import App from "./App.jsx";
import Login from "./routes/login/index.jsx";
import Checkout from "./routes/checkout/index.jsx";
import ForgotPassword from "./routes/forgot-password/index.jsx";
import ResetPassword from "./routes/reset-password/index.jsx";
import Dashboard from "./routes/dashboard/index.jsx";
import ToastProvider from "./components/Toastprovider.jsx";
import { DashboardContent } from "./routes/dashboard/components/DashboardContent.jsx";
import Campaigns from "./routes/campaigns/index.jsx";
import { CampaignContent } from "./routes/campaigns/components/CampaignContent.jsx";
import { CreateCampaign } from "./routes/campaigns/create-campaign/CreateCampaign.jsx";
import { Templates } from "./routes/campaigns/templates/templates.jsx";
import Workflows from "./routes/campaigns/workflow/Workflows.jsx";
import SocialEngagements from "./routes/social-engagements/index.jsx";
import Personas from "./routes/campaigns/personas/components/Personas.jsx";
import Inbox from "./routes/inbox/index.jsx";
import Logout from "./routes/logout/index.jsx";
import Settings from "./routes/settings/index.jsx";
import Billing from "./routes/billing/index.jsx";
import EditCampaign from "./routes/campaigns/edit/EditCampaign.jsx";

import Admin from "./routes/admin/index.jsx";
import AdminDashboard from "./routes/admin/dashboard/index.jsx";
import AdminUsers from "./routes/admin/users/index.jsx";
import AdminAgencies from "./routes/admin/Agencies/index.jsx";
import AdminCancellations from "./routes/admin/cancellations/index.jsx";
import AdminSettings from "./routes/admin/settings/index.jsx";
import AdminNotifications from "./routes/admin/notifications/index.jsx";
import AgencyEdit from "./routes/admin/agencies/edit/AgencyEdit.jsx";
import UserEdits from "./routes/admin/users/edit/UserEdits.jsx";

import Agency from "./routes/agency/index.jsx";
import AgencyDashboard from "./routes/agency/dashboard/index.jsx";
import AgencyUsers from "./routes/agency/users/index.jsx";
import SubAgencies from "./routes/agency/sub-agencies/index.jsx";
import AgencySettings from "./routes/agency/settings/index.jsx";
import AgencyNotifications from "./routes/agency/notifications/index.jsx";
import AgencyLogs from "./routes/agency/agency-logs/index.jsx";
import AgencyInbox from "./routes/agency/inbox/index.jsx";
import AgencyTemplates from "./routes/agency/templates/index.jsx";
import AgencyWorkflows from "./routes/agency/workflows/index.jsx";
import AgencyBilling from "./routes/agency/billing/index.jsx";
import AgencyUserEdit from "./routes/agency/users/edit/index.jsx";
import FeatureSuggestion from "./routes/feature-suggestion/index.jsx";
import AgencyFeatureSuggestion from "./routes/agency/feature-suggestion/index.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import CampaignPrivateRoute from "./components/CompaignPrivateRoute.jsx";
import AdminPrivateRoute from "./components/AdminPrivateRoute.jsx";
import IntercomWidget from "./components/IntercomWidget.jsx";
import AgencyPermissionRoute from "./components/AgencyPermissionRoute.jsx";
const routes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/logout", element: <Logout /> },
  { path: "/checkout/*", element: <Checkout /> },

  {
    path: "/",
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    children: [{ index: true, element: <DashboardContent /> }],
  },
  {
    path: "/campaigns",
    element: (
      <PrivateRoute>
        <AgencyPermissionRoute permissionKey="campaigns">
          <Campaigns />
        </AgencyPermissionRoute>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <CampaignContent /> },
      {
        path: "create",
        element: (
          <CampaignPrivateRoute>
            <CreateCampaign />
          </CampaignPrivateRoute>
        ),
      },
      {
        path: "edit/:id",
        element: <EditCampaign />,
      },
      {
        path: "templates",
        element: (
          <AgencyPermissionRoute permissionKey="templates">
            <Templates />
          </AgencyPermissionRoute>
        ),
      },
      {
        path: "workflows",
        element: (
          <AgencyPermissionRoute permissionKey="workflows">
            <Workflows />
          </AgencyPermissionRoute>
        ),
      },
      {
        path: "personas",
        element: (
          <AgencyPermissionRoute permissionKey="personas">
            <Personas />
          </AgencyPermissionRoute>
        ),
      },
    ],
  },
  {
    path: "/social-engagements",
    element: (
      <PrivateRoute>
        <AgencyPermissionRoute permissionKey="social_engagement">
          <SocialEngagements />
        </AgencyPermissionRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/inbox",
    element: (
      <PrivateRoute>
        <AgencyPermissionRoute permissionKey="inbox">
          <Inbox />
        </AgencyPermissionRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <AgencyPermissionRoute permissionKey="settings">
        <Settings />
      </AgencyPermissionRoute>
    ),
  },
  {
    path: "/billing",
    element: (
      <PrivateRoute>
        <AgencyPermissionRoute permissionKey="billing">
          <Billing />
        </AgencyPermissionRoute>
      </PrivateRoute>
    ),
  },
  {
    path: "/feature-suggestion",
    element: (
      <PrivateRoute>
        <FeatureSuggestion />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminPrivateRoute>
        <Admin />
      </AdminPrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "users/edit/:id", element: <UserEdits /> },
      { path: "agencies", element: <AdminAgencies /> },
      { path: "agencies/edit/:id", element: <AgencyEdit /> },
      { path: "cancellations", element: <AdminCancellations /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "notifications", element: <AdminNotifications /> },
    ],
  },
  {
    path: "/agency",
    element: <Agency />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AgencyDashboard /> },
      { path: "users", element: <AgencyUsers /> },
      { path: "users/edit/:id", element: <AgencyUserEdit /> },
      { path: "agency-logs", element: <AgencyLogs /> },
      { path: "inbox", element: <AgencyInbox /> },
      { path: "templates", element: <AgencyTemplates /> },
      { path: "workflows", element: <AgencyWorkflows /> },
      { path: "sub-agencies", element: <SubAgencies /> },
      { path: "settings", element: <AgencySettings /> },
      { path: "billing", element: <AgencyBilling /> },
      { path: "feature-suggestion", element: <AgencyFeatureSuggestion /> },
      { path: "notifications", element: <AgencyNotifications /> },
    ],
  },
];

const renderRoutes = routes =>
  routes.map(({ path, element, children, index }) => (
    <Route key={path || "index"} path={path} element={element} index={index}>
      {children && renderRoutes(children)}
    </Route>
  ));

const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IntercomProvider appId={INTERCOM_APP_ID}>
      <BrowserRouter>
        <ToastProvider />
        <ScrollToTop />
        <IntercomWidget />
        <Routes>{renderRoutes(routes)}</Routes>
      </BrowserRouter>
    </IntercomProvider>
  </StrictMode>,
);
