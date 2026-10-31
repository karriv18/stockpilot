import React from "react";
import {
  Mail,
  Camera,
  UserRound,
  ShieldCheck,
  LockKeyhole,
  X,
  Save,
  Upload,
  CalendarDays,
} from "lucide-react";
import Button from "../components/ui/Button";
const ProfilePage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-32 bg-linear-to-r from-slate-800 via-slate-700 to-slate-600" />

        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-12">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 shadow-sm">
                <UserRound size={42} className="text-gray-400" />

                <Button className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-slate-800 p-2 text-white shadow-sm transition hover:bg-slate-700">
                  <Camera size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
