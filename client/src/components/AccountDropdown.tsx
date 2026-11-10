import { useState, useRef, useEffect } from "react";
import {
  UserRound,
  Info,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Button from "./ui/Button";

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/logout", { replace: true });
  };

  const menuItems = [
    {
      label: "Profile",
      icon: UserRound,
      action: () => navigate("/me/profile"),
    },
    {
      label: "About",
      icon: Info,
      action: () => navigate("/about"),
    },
    {
      label: "Privacy Settings",
      icon: ShieldCheck,
      action: () => navigate("/privacy"),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-full  bg-background p-1.5 transition hover:bg-lightgray"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          SP
        </span>
        <ChevronDown
          size={16}
          className={`mr-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl bg-background shadow-lg"
          role="menu"
        >
          <div className="px-4 py-3">
            <p className="text-sm font-semibold">My Account</p>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>

          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item?.icon;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
                  role="menuitem"
                >
                  <Icon size={17} className="text-muted-foreground" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className=" p-2">
            <Button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition hover:bg-background hover:text-white"
              role="menuitem"
            >
              <LogOut size={17} />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
