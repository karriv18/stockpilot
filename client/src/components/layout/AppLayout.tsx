import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
const pageDetails: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview of your inventory and operations.",
  },
  "/products": {
    title: "Products",
    description: "Manage your product catalog.",
  },
  "/products/new": {
    title: "Add product",
    description: "Add a new item to your catalog.",
  },
  "/inventory": {
    title: "Inventory",
    description: "Track stock movements and quantities.",
  },
};
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const page =
    pageDetails[pathname] ??
    (pathname.endsWith("/edit")
      ? { title: "Edit product", description: "Update product information." }
      : {
          title: "StockPilot",
          description: "Inventory management workspace.",
        });
  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-64">
        <Header
          title={page.title}
          description={page.description}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
