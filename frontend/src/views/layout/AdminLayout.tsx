import React from "react";
import { Outlet } from "react-router";
import AppSidebar from "../../components/sidebar/AppSidebar";
function AdminLayout() {
  return (
    <div className="flex flex-col items-center">
      <AppSidebar />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
