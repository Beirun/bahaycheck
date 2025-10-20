/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, DragEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  ArrowLeft,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useVolunteerStore } from "@/stores/useVolunteerStore";
import { useToastStore } from "@/stores/useToastStore";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isVolunteer, update, loading } = useAuthStore();
  const { license } = useVolunteerStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  }, [user]);

  const handleProfileChange = (f: string, v: string) =>
    setProfileData((p) => ({ ...p, [f]: v }));

  const handlePasswordChange = (f: string, v: string) =>
    setPasswordData((p) => ({ ...p, [f]: v }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLicenseImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (profileData.firstName)
      formData.append("firstName", profileData.firstName);
    if (profileData.lastName) formData.append("lastName", profileData.lastName);
    if (licenseImage) formData.append("licenseImage", licenseImage);

    const success = await update(formData);
    if (success) {
      setIsEditing(false);
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (passwordData.currentPassword)
      formData.append("currentPassword", passwordData.currentPassword);
    if (passwordData.newPassword)
      formData.append("newPassword", passwordData.newPassword);
    if (passwordData.confirmPassword)
      formData.append("confirmPassword", passwordData.confirmPassword);

    const success = await update(formData);
    if (success) {
      useToastStore
        .getState()
        .setPending("success", "Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-20 py-4 sm:py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground flex items-center gap-2">
              <ArrowLeft
                className="h-7 w-7 cursor-pointer"
                onClick={() => router.back()}
              />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information and security settings
            </p>
          </div>
          <Avatar className="h-10 w-10">
            
              <AvatarFallback className="bg-primary text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
          </Avatar>
        </div>

        {license?.isRejected && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-500 bg-red-500/5"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>License Rejected</AlertTitle>
            <AlertDescription>
              Your license has been rejected. Please update your license
              information to continue receiving assignments.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Update your personal information and security preferences
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Profile Information
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" /> Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6 mt-6">
                {activeTab === "profile" && (
                  <form onSubmit={async(e) => await handleProfileSubmit(e)} className="space-y-6">
                    <div
                      className={`space-y-6 ${
                        !isEditing ? "pointer-events-none opacity-75" : ""
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label>First Name</Label>
                          <Input
                            value={profileData.firstName}
                            onChange={(e) =>
                              handleProfileChange("firstName", e.target.value)
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label>Last Name</Label>
                          <Input
                            value={profileData.lastName}
                            onChange={(e) =>
                              handleProfileChange("lastName", e.target.value)
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Phone Number</Label>
                        <Input value={user?.phoneNumber || ""} disabled />
                      </div>

                      {isVolunteer && (
                        <div className="space-y-4">
                          <Label>Specialization</Label>
                          <Input
                            value={license?.specialization || ""}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      )}

                      {isVolunteer && isEditing && license?.isRejected && (
                        <div className="space-y-4">
                          <Label>License</Label>
                          <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
                          >
                            {imagePreview ? (
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="h-32 w-32 object-cover rounded-full"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Drag another image to replace
                                </p>
                              </div>
                            ) : (
                              <div className="py-10 flex flex-col items-center gap-2">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Drag & drop image here or click to upload
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="imageInput"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      {!isEditing ? (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsEditing(true);
                          }}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <Button type="submit" disabled={loading}>
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                  </form>
                )}

                {activeTab === "security" && (
                  <form onSubmit={async (e) => await handlePasswordSubmit(e)}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label>Current Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className="pl-10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              Password Requirements
                            </p>
                            <ul className="text-xs text-amber-700 list-disc list-inside space-y-1">
                              <li>At least 8 characters long</li>
                              <li>Contains an uppercase letter</li>
                              <li>Contains a lowercase letter</li>
                              <li>Contains a number</li>
                              <li>Passwords must match</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Updating..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
