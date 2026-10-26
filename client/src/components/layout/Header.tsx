import { Bell, Menu, Search } from "lucide-react";
type HeaderProps = {
  onMenuClick: () => void;
  title: string;
  description: string;
};
export default function Header({
  onMenuClick,
  title,
  description,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline bg-surface/90 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-outline p-2 hover:bg-background lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold sm:text-xl">{title}</h2>
            <p className="hidden text-sm text-muted sm:block">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Search"
            className="rounded-xl border border-outline p-2.5 text-muted hover:bg-background"
          >
            <Search size={19} />
          </button>
          <button
            aria-label="Notifications"
            className="relative rounded-xl border border-outline p-2.5 text-muted hover:bg-background"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            SP
          </div>
        </div>
      </div>
    </header>
  );
}
