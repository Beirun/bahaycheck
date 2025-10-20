"use client";

import { useState, useRef } from "react";
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
import { Eye, EyeOff, Loader2, Heart, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignUpPage() {
  const router = useRouter();
  const { signup, verify, loading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [license, setLicense] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [verification, setVerification] = useState<string[]>(Array(6).fill(""));
  const [specialization, setSpecialization] = useState('')
  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVolunteer && step === 1) return setStep(2);
    try {
      const rawPhone = phone.replace(/\s/g, "");
      if (!firstName || !lastName || !rawPhone || !password || !confirmPw)
        throw new Error("All fields are required");
      if (password !== confirmPw) throw new Error("Passwords do not match");

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phoneNumber", rawPhone);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPw);
      formData.append("role", isVolunteer ? "volunteer" : "citizen");
      if (license) formData.append("licenseImage", license);
      if(specialization) formData.append('specialization', specialization);

      const res = await signup(formData);
      if(res) return true
      else return false
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      return false;
    }
  };

  const handleLicenseUpload = (file: File) => {
    setLicense(file);
    setLicensePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleLicenseUpload(file);
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    if (!license) return;
    const res = await handleSignupSubmit(e);
    if(res) setStep(3);
  };

  const handleVerificationSubmit = async () => {
    const code = verification.join("");
    if (!phone || code.length < 6) return;

    const rawPhone = phone.replace(/\s/g, "");
    await verify(rawPhone, code, router);
  };

  return (
    <div className="min-h-screen w-screen flex sm:items-center justify-center bg-background sm:px-6 sm:py-10">
      <Card className="w-screen sm:max-w-lg sm:shadow-lg rounded-none sm:rounded-xl border-0 sm:border sm:border-border pt-12 px-4 sm:p-8">
        {step === 1 && (
          <>
            <CardHeader className="space-y-2 mb-6">
              <CardTitle className="text-center text-4xl font-bold tracking-tight">
                {isVolunteer ? "Sign Up as Volunteer" : "Sign Up as Citizen"}
              </CardTitle>
              <CardDescription className="text-center text-base text-muted-foreground">
                {isVolunteer
                  ? "Join us as a volunteer by providing your personal details and skills."
                  : "Create an account with your personal details and password."}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSignupSubmit} className="space-y-8">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-base">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-base">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

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

                <div className="space-y-3">
                  <Label htmlFor="confirmPw" className="text-base">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPw"
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="pr-12 h-12 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 mt-1.5 text-muted-foreground hover:bg-transparent"
                    >
                      {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  ) : isVolunteer ? (
                    "Continue"
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                  onClick={() => setIsVolunteer(!isVolunteer)}
                >
                  <Heart size={18} />
                  {isVolunteer ? "Sign Up as Citizen" : "Sign Up as Volunteer"}
                </Button>
                <p className="text-base text-center text-muted-foreground">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/signin")}
                className="text-primary hover:underline cursor-pointer"
              >
                Sign in Here!
              </span>
            </p>
              </CardFooter>
            </form>
          </>
        )}

        {step === 2 && isVolunteer && (
          <>
  <CardHeader className="space-y-2 mb-6">
    <CardTitle className="text-center text-2xl font-bold tracking-tight">
      Upload Your License
    </CardTitle>
    <CardDescription className="text-center text-base text-muted-foreground">
      Drag and drop or click to upload a valid license.
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-6">
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="border border-dashed border-border rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative"
    >
      {!licensePreview ? (
        <>
          <Upload size={32} className="mb-2" />
          <p className="text-muted-foreground">
            Drag & drop image or click to select
          </p>
        </>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={licensePreview}
            alt="License Preview"
            className="object-contain w-full h-full rounded"
            fill
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.stopPropagation()
              setLicense(null)
              setLicensePreview(null)
            }}
          >
            <Trash2 size={20} />
          </Button>
        </div>
      )}
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={(e) =>
          e.target.files?.[0] && handleLicenseUpload(e.target.files[0])
        }
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="specialization" className="text-base font-medium">
        Specialization
      </Label>
      <Input
        id="specialization"
        placeholder="Structural Engineer"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        className="h-12 text-base"
      />
    </div>
  </CardContent>

  <CardFooter>
    <Button
      onClick={handleLicenseSubmit}
      className="w-full h-12 text-lg font-semibold"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin h-5 w-5 mr-2" />
      ) : (
        "Upload License"
      )}
    </Button>
  </CardFooter>
</>

        )}

        {step === 3 && (
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
        )}
      </Card>
    </div>
  );
}
