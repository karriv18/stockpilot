import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Package,
  TriangleAlert,
  WalletCards,
  RefreshCw,
} from "lucide-react";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { getDashboard } from "../services/dashboardService";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import type { AuthState } from "../stores/authStore";

const statConfig = [
  {
    key: "totalProducts",
    label: "Total products",
    note: "Across your catalog",
    icon: Package,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    key: "unitsInStock",
    label: "Units in stock",
    note: "Current stock quantity",
    icon: Boxes,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    key: "lowStockItems",
    label: "Low-stock items",
    note: "Needs your attention",
    icon: TriangleAlert,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "stockMovementsThisMonth",
    label: "Stock movements",
    note: "Recorded this month",
    icon: WalletCards,
    tone: "bg-emerald-50 text-emerald-700",
  },
] as const;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => {
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }
      return getDashboard(token);
    },
    enabled: Boolean(token),
  });

  if (!token) {
    return (
      <Card className="p-6">
        <h2 className="font-bold">Authentication required</h2>
        <p className="mt-2 text-sm text-muted">
          Please log in to view your inventory dashboard.
        </p>
      </Card>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Good day</h1>
          <p className="mt-1 text-sm text-muted">
            Loading your inventory dashboard...
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statConfig.map(({ label }) => (
            <Card key={label} className="h-36 animate-pulse p-5">
              <div className="h-4 w-28 rounded bg-background" />
              <div className="mt-5 h-8 w-20 rounded bg-background" />
              <div className="mt-4 h-3 w-36 rounded bg-background" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    clearAuth();
    navigate("/login", { replace: true });
  }

  const stats = data?.stats;
  const movements = data?.movements ?? [];
  const lowStock = data?.lowStock ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Good day</h1>
          <p className="mt-1 text-sm text-muted">
            Here’s what’s happening with your inventory today.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>

          <Button onClick={() => window.location.assign("/products/new")}>
            <Package size={17} />
            Add product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(({ key, label, note, icon: Icon, tone }) => (
          <Card key={key} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted">{label}</p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight">
                  {formatNumber(stats?.[key])}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon size={21} />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted">{note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-outline px-5 py-4">
            <div>
              <h2 className="font-bold">Recent stock movements</h2>
              <p className="mt-1 text-xs text-muted">
                Latest inventory transactions
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.assign("/inventory")}
            >
              View all
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline">
                {movements.length > 0 ? (
                  movements.map((item) => (
                    <tr key={item.id} className="hover:bg-background/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{item.product}</p>
                        <p className="mt-1 text-xs text-muted">{item.sku}</p>
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={item.type === "IN" ? "success" : "info"}
                        >
                          {item.type === "IN" ? (
                            <span className="inline-flex items-center gap-1">
                              <ArrowDownRight size={13} />
                              Stock in
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <ArrowUpRight size={13} />
                              Stock out
                            </span>
                          )}
                        </Badge>
                      </td>

                      <td
                        className={`px-4 py-4 font-bold ${
                          item.type === "IN"
                            ? "text-emerald-700"
                            : "text-blue-700"
                        }`}
                      >
                        {item.type === "IN" ? "+" : "-"}
                        {formatNumber(item.quantity)}
                      </td>

                      <td className="px-4 py-4 text-muted">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-muted"
                    >
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-outline px-5 py-4">
            <div>
              <h2 className="font-bold">Low-stock alerts</h2>
              <p className="mt-1 text-xs text-muted">Products running low</p>
            </div>

            <Badge variant="warning">{lowStock.length} alerts</Badge>
          </div>

          <div className="divide-y divide-outline">
            {lowStock.length > 0 ? (
              lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <TriangleAlert size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">{item.sku}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-bold text-amber-700">
                      {formatNumber(item.quantity)} left
                    </p>
                    <p className="mt-1 text-xs text-muted">Low stock</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted">
                No low-stock products. Your inventory looks good!
              </p>
            )}
          </div>

          <div className="border-t border-outline p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.assign("/products")}
            >
              Review products
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
