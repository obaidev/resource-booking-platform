import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

import CreateWorkspace from "./components/owner/WorkspaceForm";
import LoginForm from "./pages/auth/LoginPage";
import RegistrationForm from "./pages/auth/RegistrationPage";

import BookingPage from "./pages/customer/BookingPage";
import MyBookings from "./pages/customer/MyBookingsPage";
import ResourcesPage from "./pages/customer/ResourcesPage";

import CreateResource from "./pages/owner/CreateResourcePage";
import EditResource from "./pages/owner/EditResourcePage";
import EditWorkspace from "./pages/owner/EditWorkspacePage";
import MyResources from "./pages/owner/MyResourcesPage";
import MyWorkspaces from "./pages/owner/MyWorkspacesPage";
import OwnerBookings from "./pages/owner/OwnerBookingsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AllBookingsPage from "./pages/admin/AllBookingsPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />

        {/* Customer routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Owner routes */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route path="/my-workspaces" element={<MyWorkspaces />} />
          <Route path="/create-workspace" element={<CreateWorkspace />} />
          <Route path="/edit-workspace/:id" element={<EditWorkspace />} />

          <Route path="/my-resources" element={<MyResources />} />
          <Route path="/create-resource" element={<CreateResource />} />
          <Route path="/edit-resource/:id" element={<EditResource />} />

          <Route path="/owner-bookings" element={<OwnerBookings />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings" element={<AllBookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
