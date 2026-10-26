import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Package,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const stats = [
  {
    label: "Total products",
    value: "128",
    note: "Across your catalog",
    icon: Package,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    label: "Units in stock",
    value: "3,842",
    note: "Current stock quantity",
    icon: Boxes,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    label: "Low-stock items",
    value: "7",
    note: "Needs your attention",
    icon: TriangleAlert,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    label: "Stock movements",
    value: "36",
    note: "Recorded this month",
    icon: WalletCards,
    tone: "bg-emerald-50 text-emerald-700",
  },
];
const movements = [
  {
    product: "Wireless Mouse",
    sku: "ACC-1042",
    type: "IN",
    quantity: "+24",
    date: "Oct 26, 2026",
    user: "Admin",
  },
  {
    product: "USB-C Hub",
    sku: "ACC-1038",
    type: "OUT",
    quantity: "-5",
    date: "Oct 26, 2026",
    user: "Admin",
  },
  {
    product: "Mechanical Keyboard",
    sku: "ACC-1021",
    type: "IN",
    quantity: "+12",
    date: "Oct 25, 2026",
    user: "Admin",
  },
  {
    product: "Laptop Stand",
    sku: "ACC-1017",
    type: "OUT",
    quantity: "-3",
    date: "Oct 25, 2026",
    user: "Admin",
  },
];
const lowStock = [
  { name: "USB-C Hub", sku: "ACC-1038", quantity: 3 },
  { name: "Laptop Stand", sku: "ACC-1017", quantity: 4 },
  { name: "HDMI Adapter", sku: "ACC-1009", quantity: 2 },
];
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Good day</h1>
          <p className="mt-1 text-sm text-muted">
            Here’s what’s happening with your inventory today.
          </p>
        </div>
        <Button onClick={() => window.location.assign("/products/new")}>
          <Package size={17} /> Add product
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted">{label}</p>
                <p className="mt-3 text-3xl font-extrabold tracking-tight">
                  {value}
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
                {movements.map((item) => (
                  <tr
                    key={`${item.sku}-${item.date}`}
                    className="hover:bg-background/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.product}</p>
                      <p className="mt-1 text-xs text-muted">{item.sku}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.type === "IN" ? "success" : "info"}>
                        {item.type === "IN" ? (
                          <span className="inline-flex items-center gap-1">
                            <ArrowDownRight size={13} /> Stock in
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <ArrowUpRight size={13} /> Stock out
                          </span>
                        )}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-4 font-bold ${item.type === "IN" ? "text-emerald-700" : "text-blue-700"}`}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-muted">{item.date}</td>
                  </tr>
                ))}
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
            {lowStock.map((item) => (
              <div
                key={item.sku}
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
                    {item.quantity} left
                  </p>
                  <p className="mt-1 text-xs text-muted">Low stock</p>
                </div>
              </div>
            ))}
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
      <p className="text-xs text-muted">
        Preview data only — dashboard values will be replaced with live API data
        during integration.
      </p>
    </div>
  );
}
