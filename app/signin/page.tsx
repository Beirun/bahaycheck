"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignInPage() {
  const router = useRouter();
  const { signin, verify, loading } = useAuthStore();
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [verification, setVerification] = useState<string[]>(Array(6).fill(""));

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleVerificationSubmit = async () => {
    const code = verification.join("");
    if (!phone || code.length < 6) return;

    const rawPhone = phone.replace(/\s/g, "");
    await verify(rawPhone, code, router, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = phone.replace(/\s/g, "");
    if (!raw || !password) return;

    // await handleTest()

    const res = await signin(raw, password, router);

    if (!res) setIsNotVerified(true);
  };

  return (
    <div className="min-h-screen w-screen flex sm:items-center justify-center bg-background sm:px-6 sm:py-10">
      <Card className="w-screen sm:max-w-lg sm:shadow-lg rounded-none sm:rounded-xl border-0 sm:border sm:border-border justify-center pb-32 px-4 sm:p-8">
        {isNotVerified === true ? (
          <>
            <CardHeader className="space-y-2 mb-6">
              <CardTitle className="text-center text-2xl font-bold tracking-tight">
                Verify Phone Number
              </CardTitle>
              <CardDescription className="text-center text-base text-muted-foreground">
                Enter the 6-digit code sent to your mobile number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerificationSubmit();
                }}
                className="flex justify-center gap-2"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg"
                    value={verification[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newCode = [...verification];
                      if (val) {
                        newCode[i] = val[0];
                        setVerification(newCode);
                        if (i < 5)
                          document.getElementById(`code-${i + 1}`)?.focus();
                      } else {
                        newCode[i] = "";
                        setVerification(newCode);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newCode = [...verification];
                        if (verification[i]) {
                          newCode[i] = "";
                          setVerification(newCode);
                        } else if (i > 0) {
                          document.getElementById(`code-${i - 1}`)?.focus();
                          const prevCode = [...verification];
                          prevCode[i - 1] = "";
                          setVerification(prevCode);
                        }
                      } else if (e.key >= "0" && e.key <= "9") {
                        const newCode = [...verification];
                        newCode[i] = e.key;
                        setVerification(newCode);
                        e.preventDefault();
                        if (i < 5)
                          document.getElementById(`code-${i + 1}`)?.focus();
                      }
                    }}
                    id={`code-${i}`}
                  />
                ))}
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleVerificationSubmit}
                className="w-full h-12 text-lg font-semibold"
                disabled={loading || verification.some((v) => !v)}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 mb-6">
              <CardTitle className="text-center text-4xl font-bold tracking-tight">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-base text-muted-foreground">
                Welcome back! Please enter your phone number and password.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-8">
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base">
                    Phone Number
                  </Label>
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
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
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
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    "Sign In"
                  )}
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
          </>
        )}
      </Card>
    </div>
  );
}
