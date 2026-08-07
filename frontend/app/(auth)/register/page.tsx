"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company_name: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerUser(values);
      toast.success("Academy created successfully");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Unable to register";
      toast.error(message);
    }
  });

  return (
    <Card className="border-slate-200/80 shadow-xl dark:border-white/10">
      <CardHeader>
        <CardTitle>Create academy</CardTitle>
        <CardDescription>Register your company and admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {(
            [
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["company_name", "Company / Academy name", "text"],
              ["password", "Password", "password"],
              ["password_confirmation", "Confirm password", "password"],
            ] as const
          ).map(([name, label, type]) => (
            <div className="space-y-2" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} type={type} {...form.register(name)} />
              {form.formState.errors[name] ? (
                <p className="text-sm text-red-500">{form.formState.errors[name]?.message}</p>
              ) : null}
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
