import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const schema = z.object({
  productId: z.string().min(1, "Select a product."),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  note: z.string().optional(),
});

type MovementFormInput = z.input<typeof schema>;
type MovementForm = z.output<typeof schema>;

const recent = [
  {
    product: "Wireless Mouse",
    sku: "ACC-1042",
    type: "IN",
    quantity: 24,
    note: "Restock delivery",
    date: "Oct 26, 2026",
  },
  {
    product: "USB-C Hub",
    sku: "ACC-1038",
    type: "OUT",
    quantity: 5,
    note: "Order fulfillment",
    date: "Oct 26, 2026",
  },
  {
    product: "Mechanical Keyboard",
    sku: "ACC-1021",
    type: "IN",
    quantity: 12,
    note: "Restock delivery",
    date: "Oct 25, 2026",
  },
];

export default function InventoryPage() {
  const [notice, setNotice] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovementFormInput, unknown, MovementForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      type: "IN",
      quantity: 1,
      note: "",
    },
  });

  const type = watch("type");

  const onSubmit = async (_data: MovementForm) => {
    setNotice("Movement validated. Inventory API integration is pending.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Inventory movements</h1>
        <p className="mt-1 text-sm text-muted">
          Record stock received and stock issued, with a transaction history.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <Card>
          <div className="mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowLeftRight size={21} />
            </div>
            <h2 className="mt-4 text-lg font-bold">Record a movement</h2>
            <p className="mt-1 text-sm text-muted">
              Choose a product and enter the quantity.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="productId"
                className="mb-1.5 block text-sm font-semibold"
              >
                Product <span className="text-danger">*</span>
              </label>

              <select
                id="productId"
                className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                {...register("productId")}
              >
                <option value="">Select a product</option>
                <option value="1">Wireless Mouse (ACC-1042)</option>
                <option value="2">USB-C Hub (ACC-1038)</option>
                <option value="3">Mechanical Keyboard (ACC-1021)</option>
                <option value="4">Laptop Stand (ACC-1017)</option>
              </select>

              {errors.productId && (
                <p className="mt-1 text-xs text-danger">
                  {errors.productId.message}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Movement type</p>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold ${
                    type === "IN"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-outline"
                  }`}
                >
                  <input type="radio" value="IN" {...register("type")} />
                  <ArrowDownToLine size={17} />
                  Stock in
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold ${
                    type === "OUT"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-outline"
                  }`}
                >
                  <input type="radio" value="OUT" {...register("type")} />
                  <ArrowUpFromLine size={17} />
                  Stock out
                </label>
              </div>
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              step="1"
              required
              error={errors.quantity?.message}
              {...register("quantity")}
            />

            <div>
              <label
                htmlFor="note"
                className="mb-1.5 block text-sm font-semibold"
              >
                Note
              </label>
              <textarea
                id="note"
                rows={3}
                placeholder="e.g. Restock delivery, order fulfillment"
                className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                {...register("note")}
              />
            </div>

            {notice && (
              <p
                role="status"
                className="rounded-lg border border-outline bg-background p-3 text-sm text-muted"
              >
                {notice}
              </p>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Record {type === "IN" ? "stock in" : "stock out"}
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="border-b border-outline px-5 py-4">
            <h2 className="font-bold">Recent movements</h2>
            <p className="mt-1 text-xs text-muted">
              A history of inventory changes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full mmin-w-145 text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline">
                {recent.map((item) => (
                  <tr key={`${item.sku}-${item.date}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.product}</p>
                      <p className="mt-1 text-xs text-muted">{item.note}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.type === "IN" ? "success" : "info"}>
                        {item.type === "IN" ? "Stock in" : "Stock out"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-bold">
                      {item.type === "IN" ? "+" : "-"}
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-muted">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-outline p-5 text-xs text-muted">
            Preview data only — transaction history will use the inventory API.
          </div>
        </Card>
      </div>
    </div>
  );
}
