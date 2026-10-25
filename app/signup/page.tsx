"use client"
import { useState, FormEvent } from "react";
import { SignupForm } from "@/components/signup-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  date: string;
  address: string;
  postcode: string;
  city: string;
  country: string;  
}
export default function SignupPage() {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    date: "",
    address: "",
    postcode: "",
    city: "",
    country: "",
   });
   const [error, setError] = useState<string | null>(null);
 
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setForm({ ...form, [e.target.name]: e.target.value });
   };
   const handleSubmit = async (e: FormEvent) => {
     e.preventDefault();
     setError(null);
     try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/register`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           username: form.username,
           email: form.email,
           password: form.password,
           confirmPassword: form.password,
           birthdate: form.date,
           address: form.address,
           postalCode: form.postcode,
           city: form.city,
         }),
         credentials: "include" 
       });
       if (!res.ok) {
         const data = await res.json().catch(() => null);
         throw new Error(data?.message ?? "Failed to sign up");
       }
       window.location.href = "/login";
     }
       catch (error) {
         console.error(error);
         setError(error instanceof Error ? error.message : "Failed to sign up");
       }
     }
 
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            SouflyHub.dev
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <h1 className="text-2xl font-bold text-center">Sign Up</h1>
            <p className="text-sm text-balance text-muted-foreground text-center mb-4">
              Create your account by entering your email and password below
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
            <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <Input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <Input type="date" name="date" value={form.date} onChange={handleChange} placeholder="Date of Birth" required />
            <Input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
            <Input type="text" name="postcode" value={form.postcode} onChange={handleChange} placeholder="Postcode" required />
            <Input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
            <Input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" required />
            <Button type="submit" onClick={handleSubmit}>Sign Up</Button>
            {error && <p className="text-red-500">{error}</p>}
            </form>
          </div>
        </div>
        <div className="flex justify-center gap-2 md:justify-start">
          <p className="text-sm text-balance text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Login
            </a>
          </p>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://assets.souflyhub.dev/images/upload/souflydev.webp"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
