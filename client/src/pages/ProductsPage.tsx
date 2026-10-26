import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const demoProducts = [
  { id: 1, name: "Wireless Mouse", sku: "ACC-1042", price: 799, quantity: 24 },
  { id: 2, name: "USB-C Hub", sku: "ACC-1038", price: 1499, quantity: 3 },
  {
    id: 3,
    name: "Mechanical Keyboard",
    sku: "ACC-1021",
    price: 2899,
    quantity: 12,
  },
  { id: 4, name: "Laptop Stand", sku: "ACC-1017", price: 999, quantity: 4 },
];
export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const products = demoProducts.filter((p) =>
    `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">Products</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your product catalog and stock levels.
          </p>
        </div>
        <Button onClick={() => window.location.assign("/products/new")}>
          <Plus size={17} /> Add product
        </Button>
      </div>
      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">All products</h2>
            <p className="mt-1 text-sm text-muted">
              {products.length} products shown
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              label="Search products"
              placeholder="Search name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead className="border-y border-outline bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-background/70">
                  <td className="px-4 py-4 font-semibold">{p.name}</td>
                  <td className="px-4 py-4 text-muted">{p.sku}</td>
                  <td className="px-4 py-4">
                    ₱{p.price.toLocaleString("en-PH")}
                  </td>
                  <td className="px-4 py-4">{p.quantity}</td>
                  <td className="px-4 py-4">
                    <Badge variant={p.quantity <= 5 ? "warning" : "success"}>
                      {p.quantity <= 5 ? "Low stock" : "In stock"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      className="font-semibold text-primary hover:underline"
                      to={`/products/${p.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-10 text-center text-sm text-muted">
              <Search className="mx-auto mb-2" size={20} />
              No products match your search.
            </div>
          )}
        </div>
      </Card>
      <p className="text-xs text-muted">
        Preview data only — product CRUD will be connected to the backend next.
      </p>
    </div>
  );
}
