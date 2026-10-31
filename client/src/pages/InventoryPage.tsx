import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

import { getProducts } from "../services/productService";
import {
  createInventoryMovement,
  getInventoryMovements,
} from "../services/inventoryService";
import { useAuthStore } from "../stores/authStore";
import type { AuthState } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  productId: z.string().min(1, "Select a product."),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  note: z.string().max(500, "Note cannot exceed 500 characters.").optional(),
});

type MovementFormInput = z.input<typeof schema>;
type MovementForm = z.output<typeof schema>;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function InventoryPage() {
  const [notice, setNotice] = useState("");

  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
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

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(token!),
    enabled: Boolean(token),
  });

  const movementsQuery = useQuery({
    queryKey: ["inventory-movements"],
    queryFn: () => getInventoryMovements(token!),
    enabled: Boolean(token),
  });

  const movementMutation = useMutation({
    mutationFn: (data: MovementForm) => {
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      return createInventoryMovement(
        {
          productId: Number(data.productId),
          type: data.type,
          quantity: data.quantity,
          note: data.note?.trim() || undefined,
        },
        token,
      );
    },

    onSuccess: async () => {
      setNotice("Inventory movement recorded successfully.");

      reset({
        productId: "",
        type: type,
        quantity: 1,
        note: "",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },

    onError: (error: Error) => {
      setNotice(error.message || "Failed to record inventory movement.");
    },
  });

  const onSubmit = (data: MovementForm) => {
    setNotice("");
    movementMutation.mutate(data);
  };

  if (!token) {
    return (
      <Card>
        <div className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="mb-3 text-muted" size={32} />
          <h2 className="font-bold">Authentication required</h2>
          <p className="mt-2 text-sm text-muted">
            Please log in to manage inventory.
          </p>
        </div>
      </Card>
    );
  }

  const products = productsQuery.data ?? [];
  const movements = movementsQuery.data ?? [];
  const isLoading = productsQuery.isPending || movementsQuery.isPending;
  const loadError = productsQuery.error || movementsQuery.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Inventory movements</h1>
        <p className="mt-1 text-sm text-muted">
          Record stock received and stock issued, with a transaction history.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={19} />
          <div className="flex-1">
            <p className="font-semibold">Unable to load inventory data</p>
            <p className="mt-1">
              {loadError instanceof Error
                ? loadError.message
                : "An unexpected error occurred."}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold"
            onClick={() => {
              void productsQuery.refetch();
              void movementsQuery.refetch();
            }}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

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
                disabled={productsQuery.isPending || products.length === 0}
                className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                {...register("productId")}
              >
                <option value="">
                  {productsQuery.isPending
                    ? "Loading products..."
                    : products.length === 0
                      ? "No products available"
                      : "Select a product"}
                </option>

                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} ({product.sku}) — Stock: {product.quantity}
                  </option>
                ))}
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
                maxLength={500}
                placeholder="e.g. Restock delivery, order fulfillment"
                className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                {...register("note")}
              />
              {errors.note && (
                <p className="mt-1 text-xs text-danger">
                  {errors.note.message}
                </p>
              )}
            </div>

            {notice && (
              <p
                role="status"
                className={`rounded-lg border p-3 text-sm ${
                  movementMutation.isError
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-outline bg-background text-muted"
                }`}
              >
                {notice}
              </p>
            )}

            <Button
              type="submit"
              loading={movementMutation.isPending}
              disabled={
                movementMutation.isPending ||
                productsQuery.isPending ||
                products.length === 0
              }
              className="w-full"
            >
              {movementMutation.isPending ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : null}
              Record {type === "IN" ? "stock in" : "stock out"}
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="border-b border-outline px-5 py-4">
            <h2 className="font-bold">Recent movements</h2>
            <p className="mt-1 text-xs text-muted">
              {movements.length} transaction
              {movements.length === 1 ? "" : "s"} recorded
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Quantity
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 4 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-5">
                          <div className="h-4 animate-pulse rounded bg-background" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : movements.length > 0 ? (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{movement.product.name}</p>
                        <p className="mt-1 text-xs text-muted">
                          {movement.product.sku}
                          {movement.note ? ` · ${movement.note}` : ""}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={movement.type === "IN" ? "success" : "info"}
                        >
                          {movement.type === "IN" ? "Stock in" : "Stock out"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {movement.type === "IN" ? "+" : "-"}
                        {movement.quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted">
                        {formatDate(movement.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <ArrowLeftRight
                        className="mx-auto mb-3 text-muted"
                        size={28}
                      />
                      <p className="font-semibold">No movements yet</p>
                      <p className="mt-1 text-sm text-muted">
                        Your recorded inventory transactions will appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
