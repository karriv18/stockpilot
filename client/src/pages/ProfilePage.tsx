import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  LoaderCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash,
  Camera,
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  CalendarDays,
  Save,
  X,
  Upload,
} from "lucide-react";
import { getProfile } from "../services/profileService";
import { useAuthStore } from "../stores/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import type { AuthState } from "../stores/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);
  const token = useAuthStore((state) => state.token);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => {
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }
      return getProfile(user?.id ?? 0, token);
    },
    enabled: Boolean(token),
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must not exceed 5MB.");
      return;
    }

    if (profileImage) URL.revokeObjectURL(profileImage);

    setSelectedFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleCancelImage = () => {
    if (profileImage) URL.revokeObjectURL(profileImage);

    setProfileImage(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({ name, email, selectedFile });
  };

  if (!token) {
    return (
      <Card>
        <div className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="mb-3 text-muted" size={32} />
          <h2 className="font-bold">Authentication required</h2>
          <p className="mt-2 text-sm text-muted">
            Please log in to view your inventory dashboard.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-32 bg-linear-to-r from-slate-800 via-slate-700 to-slate-600" />

        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-12">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 shadow-sm">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <UserRound size={42} className="text-gray-400" />
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-slate-800 p-2 text-white shadow-sm transition hover:bg-slate-700"
                  title="Upload profile picture"
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {name || "Your Name"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {email || "your@email.com"}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={13} />
                Active Account
              </span>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 pb-1">
              <span className="max-w-36 truncate text-xs text-gray-500">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={handleCancelImage}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Remove selected image"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Personal Information */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal details and contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Email changes must be validated by the server.
                </p>
              </div>
            </div>
          </section>

          {/* Profile Picture */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">
                Profile Picture
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a picture to personalize your StockPilot account.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Selected profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={32} className="text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleCancelImage}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  JPG, PNG, or WebP. Maximum file size: 5MB.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Account Information */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-bold text-gray-900">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your StockPilot account details.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2.5">
                  <UserRound size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">User ID</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {user?.id ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2.5">
                  <Mail size={18} className="text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Registered Email</p>
                  <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                    {user?.email ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2.5">
                  <CalendarDays size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Account Status</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5">
                <LockKeyhole size={19} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Security</h3>
                <p className="text-xs text-gray-500">
                  Keep your account secure.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Password</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Keep your password private and update it regularly.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-400"
              >
                Change Password
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Coming soon
              </p>
            </div>
          </section>
        </div>

        {/* Save Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end lg:col-span-3">
          <button
            type="button"
            onClick={() => {
              setName(user?.name ?? "");
              setEmail(user?.email ?? "");
              handleCancelImage();
            }}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Discard Changes
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
