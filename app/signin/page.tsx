"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 4) return d
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const raw = phone.replace(/\s/g, "")
      if (!raw || !password) throw new Error("All fields are required")

      await new Promise((r) => setTimeout(r, 1000))
      if (raw === "09123456789" && password === "password") {
        toast.success("Login successful")
        setTimeout(() => router.push("/dashboard"), 1000)
      } else throw new Error("Invalid credentials")
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
        <Card className="w-full max-w-lg shadow-lg border border-border p-6 sm:p-8">
          <CardHeader className="space-y-2 mb-6">
            <CardTitle className="text-center text-4xl font-bold tracking-tight">Sign In</CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Welcome back! Please enter your phone number and password.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912 345 6789"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="h-12 text-base"
                  maxLength={13}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-12 text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 mt-1.5 text-muted-foreground hover:bg-transparent"
                  >
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-5">
              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Sign In"}
              </Button>
              <p className="text-base text-center text-muted-foreground">
                Don’t have an account?{" "}
                <span
                  onClick={() => router.push("/signup")}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Sign up Here!
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  )
}
