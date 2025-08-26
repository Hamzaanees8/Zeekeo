import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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
        <Campaigns />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <CampaignContent /> },
      { path: "create", element: <CreateCampaign /> },
      { path: "edit/:id", element: <EditCampaign /> },
      { path: "templates", element: <Templates /> },
      { path: "workflows", element: <Workflows /> },
      { path: "personas", element: <Personas /> },
    ],
  },
  {
    path: "/social-engagements",
    element: (
      <PrivateRoute>
        <SocialEngagements />
      </PrivateRoute>
    ),
  },
  {
    path: "/inbox",
    element: (
      <PrivateRoute>
        <Inbox />
      </PrivateRoute>
    ),
  },
  { path: "/settings", element: <Settings /> },
  {
    path: "/billing",
    element: (
      <PrivateRoute>
        <Billing />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin",
    element: <Admin />,
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
];

const renderRoutes = routes =>
  routes.map(({ path, element, children, index }) => (
    <Route key={path || "index"} path={path} element={element} index={index}>
      {children && renderRoutes(children)}
    </Route>
  ));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider />
      <Routes>{renderRoutes(routes)}</Routes>
    </BrowserRouter>
  </StrictMode>,
);
