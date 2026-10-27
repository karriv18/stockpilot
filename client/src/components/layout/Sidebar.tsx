import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  X,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import type { AuthState } from "../../stores/authStore";

type SidebarProps = { open: boolean; onClose: () => void };

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Inventory", path: "/inventory", icon: ArrowLeftRight },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline bg-surface transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-outline px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Boxes size={22} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                StockPilot
              </h1>
              <p className="text-xs text-muted">Inventory management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-muted hover:bg-background lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Workspace
          </p>

          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`
              }
            >
              <Icon size={19} />
              {name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline p-4">
          <p className="text-xs text-muted">StockPilot</p>
          <p className="mt-1 text-sm font-medium">Inventory workspace</p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
