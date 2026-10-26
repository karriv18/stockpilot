import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Boxes, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

const schema = z.object({
  name: z.string().optional(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().optional(),
});
type FormData = z.infer<typeof schema>;
type Mode = "login" | "register";

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage("");
    clearErrors();
    reset();
  };
  const onSubmit = async (data: FormData) => {
    setMessage("");
    clearErrors();

    try {
      if (mode === "login") {
        const result = await authService.login({
          email: data.email,
          password: data.password,
        });

        setAuth(result.user, result.token);
        navigate(destination, { replace: true });
        return;
      }

      if (!data.name?.trim()) {
        setError("name", {
          type: "manual",
          message: "Full name is required.",
        });
        return;
      }

      if (!data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Please confirm your password.",
        });
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match.",
        });
        return;
      }

      await authService.register({
        name: data.name.trim(),
        email: data.email,
        password: data.password,
      });

      setMode("login");
      reset();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };
  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Boxes size={27} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            StockPilot
          </span>
        </div>
        <div className="relative max-w-lg">
          <span className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
            Inventory management
          </span>
          <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
            Your inventory.
            <br />
            Under control.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/75">
            Keep products organized, monitor stock levels, and track inventory
            movements from one workspace.
          </p>
          <div className="mt-8 space-y-4 text-sm text-white/85">
            {[
              "Monitor stock levels in one place",
              "Track stock IN and OUT",
              "Simplify inventory management",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/60">
          StockPilot · Inventory Management System
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <Boxes size={24} />
            </div>
            <span className="text-xl font-extrabold">StockPilot</span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold tracking-wider text-primary">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {mode === "login"
                ? "Sign in to your account"
                : "Create your account"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {mode === "login"
                ? "Enter your credentials to access your inventory workspace."
                : "Create an account to start managing your inventory."}
            </p>
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-background p-1">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === value ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                {value === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {mode === "register" && (
              <Input
                label="Full name"
                placeholder="Enter your full name"
                autoComplete="name"
                required
                error={errors.name?.message}
                {...register("name")}
              />
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "register"
                    ? "At least 8 characters"
                    : "Enter your password"
                }
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-9 rounded-md p-1.5 text-muted hover:bg-background"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "register" && (
              <div className="relative">
                <Input
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-9 rounded-md p-1.5 text-muted hover:bg-background"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            {message && (
              <p
                role="status"
                className="rounded-lg border border-outline bg-background p-3 text-sm text-muted"
              >
                {message}
              </p>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full py-3"
            >
              {mode === "login" ? "Sign in" : "Create account"}
              {!isSubmitting && <ArrowRight size={17} />}
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-muted">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() =>
                switchMode(mode === "login" ? "register" : "login")
              }
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
          <p className="mt-8 text-center text-xs leading-5 text-muted">
            Secure access to your inventory workspace.
          </p>
        </div>
      </section>
    </main>
  );
}
