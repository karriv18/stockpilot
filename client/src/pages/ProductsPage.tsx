import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  LoaderCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

import { deleteProduct, getProducts } from "../services/productService";
import { useAuthStore } from "../stores/authStore";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = useAuthStore((state) => state.token);

  const {
    data: products = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(token!),
    enabled: Boolean(token),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id, token!),

    onSuccess: async () => {
      setDeleteError("");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },

    onError: (error: Error) => {
      setDeleteError(error.message || "Failed to delete product.");
    },
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.sku}`.toLowerCase().includes(normalizedSearch),
    );
  }, [products, search]);

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number(price));

  const handleDelete = (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    deleteMutation.mutate(id);
  };

  if (!token) {
    return (
      <Card>
        <div className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="mb-3 text-muted" size={32} />

          <h2 className="font-bold">Authentication required</h2>

          <p className="mt-2 text-sm text-muted">
            Please log in to view and manage your products.
          </p>

          <Button className="mt-4" onClick={() => navigate("/login")}>
            Go to login
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">Products</h1>

          <p className="mt-1 text-sm text-muted">
            Manage your product catalog and stock levels.
          </p>
        </div>

        <Button onClick={() => navigate("/products/new")}>
          <Plus size={17} />
          Add product
        </Button>
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">All products</h2>

            <p className="mt-1 text-sm text-muted">
              {isPending
                ? "Loading products..."
                : `${filteredProducts.length} of ${products.length} products shown`}
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <Input
              label="Search products"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {deleteError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={18} />

            <div className="flex-1">
              <p className="font-semibold">Unable to delete product</p>
              <p className="mt-1">{deleteError}</p>
            </div>

            <button
              type="button"
              aria-label="Dismiss delete error"
              className="font-bold"
              onClick={() => setDeleteError("")}
            >
              ×
            </button>
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="mb-3 text-red-500" size={32} />

            <h3 className="font-bold">Failed to load products</h3>

            <p className="mt-2 max-w-md text-sm text-muted">
              {error instanceof Error
                ? error.message
                : "Something went wrong while fetching products."}
            </p>

            <Button
              className="mt-4"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
              Try again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-y border-outline bg-background text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3">
                    SKU
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Quantity
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline">
                {isPending ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-5">
                          <div className="h-4 animate-pulse rounded bg-background" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-background/70"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {product.name}
                      </td>

                      <td className="px-4 py-4 text-muted">{product.sku}</td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-4 py-4">{product.quantity}</td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            product.quantity <= 5 ? "warning" : "success"
                          }
                        >
                          {product.quantity <= 5 ? "Low stock" : "In stock"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            className="font-semibold text-primary hover:underline"
                            to={`/products/${product.id}/edit`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                            disabled={deleteMutation.isPending}
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === product.id ? (
                              <LoaderCircle
                                className="animate-spin"
                                size={17}
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12">
                      <div className="flex flex-col items-center text-center">
                        {search.trim() ? (
                          <Search className="mb-3 text-muted" size={28} />
                        ) : (
                          <Package className="mb-3 text-muted" size={28} />
                        )}

                        <h3 className="font-semibold">
                          {search.trim()
                            ? "No products found"
                            : "No products yet"}
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-muted">
                          {search.trim()
                            ? "Try a different product name or SKU."
                            : "Add your first product to start managing your inventory."}
                        </p>

                        {!search.trim() && (
                          <Button
                            className="mt-4"
                            onClick={() => navigate("/products/new")}
                          >
                            <Plus size={16} />
                            Add your first product
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
