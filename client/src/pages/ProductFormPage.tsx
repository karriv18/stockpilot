import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Package, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

import {
  createProduct,
  getProduct,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from "../services/productService";

import { useAuthStore } from "../stores/authStore";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  sku: z.string().trim().min(1, "SKU is required."),
  price: z.coerce
    .number()
    .finite("Enter a valid price.")
    .min(0, "Price cannot be negative."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(0, "Quantity cannot be negative."),
  description: z.string().trim().min(1, "Product description is required."),
});

type ProductFormInput = z.input<typeof schema>;
type ProductForm = z.output<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = useAuthStore((state) => state.token);

  const editing = Boolean(id) || location.pathname.endsWith("/edit");

  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  const [savedProductId, setSavedProductId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      quantity: 0,
      description: "",
    },
  });

  // Create and clean up a temporary image preview.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  // Load existing product details when editing.
  useEffect(() => {
    if (!editing || !id) return;

    if (!token) {
      setLoadError("Your session has expired. Please log in again.");
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      setLoadingProduct(true);
      setLoadError("");

      try {
        const product = await getProduct(id!, token!);

        if (cancelled) return;

        reset({
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          quantity: product.quantity,
          description: product.description ?? "",
        });

        setCurrentImageUrl(product.imageUrl ?? null);
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          error instanceof Error ? error.message : "Unable to load product.",
        );
      } finally {
        if (!cancelled) {
          setLoadingProduct(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [editing, id, token, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Allow choosing the same file again later.
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageFile(null);
      setImageError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageFile(null);
      setImageError("Image must be 5 MB or smaller.");
      return;
    }

    setImageError("");
    setNotice("");
    setImageFile(file);
  };

  const onSubmit = async (data: ProductForm) => {
    setNotice("");

    if (imageError) {
      setNotice("Please fix the image validation error before saving.");
      return;
    }

    if (!token) {
      setNotice("Your session has expired. Please log in again.");
      return;
    }

    if (editing && !id) {
      setNotice("Product ID is missing. Please reopen the edit page.");
      return;
    }

    const payload: ProductInput = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      price: data.price,
      quantity: data.quantity,
      description: data.description.trim(),
    };

    try {
      let productId = savedProductId;

      // Save the product only once.
      if (productId === null) {
        const savedProduct = editing
          ? await updateProduct(id!, payload, token)
          : await createProduct(payload, token);

        productId = savedProduct.id;
        setSavedProductId(productId);
      }

      // Upload the selected image after the product has an ID.
      if (imageFile) {
        const updatedProduct = await uploadProductImage(
          productId,
          imageFile,
          token,
        );

        setCurrentImageUrl(updatedProduct.imageUrl ?? null);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

      navigate("/products", {
        replace: true,
        state: {
          successMessage: editing
            ? "Product updated successfully."
            : "Product created successfully.",
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save product.";

      if (message.toLowerCase().includes("sku")) {
        setError("sku", {
          type: "server",
          message,
        });
      }

      setNotice(
        savedProductId !== null
          ? `The product may already be saved. Please retry the image upload or save operation: ${message}`
          : message,
      );
    }
  };

  if (editing && !id) {
    return (
      <Card>
        <p role="alert">Product ID is missing from the URL.</p>
        <Link to="/products">Back to products</Link>
      </Card>
    );
  }

  if (loadingProduct) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading product details...</p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <div className="space-y-4">
          <p role="alert" className="text-sm text-red-600">
            {loadError}
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft size={17} />
            Back to products
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"
      >
        <ArrowLeft size={17} />
        Back to products
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold">
          {editing ? "Edit product" : "Add product"}
        </h1>

        <p className="mt-1 text-sm text-muted">
          {editing
            ? "Update the details for this product."
            : "Enter the details for the new product."}
        </p>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-3 border-b border-outline pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package size={21} />
          </div>

          <div>
            <h2 className="font-bold">Product information</h2>
            <p className="mt-1 text-xs text-muted">
              Fields marked with * are required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Product name"
              placeholder="e.g. Wireless Mouse"
              required
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="SKU"
              placeholder="e.g. ACC-1042"
              required
              error={errors.sku?.message}
              {...register("sku")}
            />

            <Input
              label="Price (₱)"
              type="number"
              min="0"
              step="0.01"
              required
              error={errors.price?.message}
              {...register("price")}
            />

            <Input
              label={editing ? "Quantity" : "Initial quantity"}
              type="number"
              min="0"
              step="1"
              required
              error={errors.quantity?.message}
              {...register("quantity")}
            />
          </div>

          {/* Product image upload */}
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Product image
              </label>
              <p className="text-xs text-muted">
                JPEG, PNG, or WebP. Maximum file size: 5 MB.
              </p>
            </div>

            {(imagePreview || currentImageUrl) && (
              <div className="relative w-fit">
                <img
                  src={imagePreview ?? currentImageUrl ?? ""}
                  alt="Product preview"
                  className="h-40 w-40 rounded-xl border border-outline object-cover"
                />

                {imageFile && (
                  <button
                    type="button"
                    aria-label="Clear selected image"
                    onClick={() => {
                      setImageFile(null);
                      setImageError("");
                    }}
                    className="absolute -right-2 -top-2 rounded-full border border-outline bg-surface p-1.5 shadow-sm hover:bg-background"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-outline px-4 py-3 text-sm font-semibold transition hover:bg-background">
              <ImagePlus size={18} />
              {imageFile ? "Choose another image" : "Choose image"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </label>

            {imageError && (
              <p role="alert" className="text-sm text-red-600">
                {imageError}
              </p>
            )}
          </div>

          {/* Required description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold"
            >
              Description <span className="text-red-600">*</span>
            </label>

            <textarea
              id="description"
              rows={4}
              placeholder="Enter product description"
              required
              className="w-full rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              {...register("description")}
            />

            {errors.description?.message && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {notice && (
            <p
              role="status"
              className="rounded-lg border border-outline bg-background p-3 text-sm text-muted"
            >
              {notice}
            </p>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-outline pt-5 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={Boolean(imageError)}
            >
              {isSubmitting
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
