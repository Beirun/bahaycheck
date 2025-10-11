// app/account/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";

// Mock current user data
const currentUser = {
    firstName: "John",
    lastName: "Doe",
    phoneNo: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    role: "Structural Engineer",
};

export default function AccountSettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    phoneNo: currentUser.phoneNo,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Profile updated:", profileData);
    
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Password updated:", passwordData);
    
    setSuccessMessage("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground flex items-center gap-2">
                <ArrowLeft className="h-7 w-7" onClick={() => router.back()}/>
                Account Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account information and security settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 text-sm">{successMessage}</span>
          </div>
        )}

        {/* Settings Content */}
        <Card>
          <CardHeader>
            <CardTitle><></>Account Management</CardTitle>
            <CardDescription>
              Update your personal information and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              {/* Profile Information Tab */}
              <TabsContent value={activeTab} className="space-y-6 mt-6">
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => handleProfileChange("firstName", e.target.value)}
                              className="pl-10"
                              placeholder="Enter your first name"
                            />
                          </div>
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => handleProfileChange("lastName", e.target.value)}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phoneNo" className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNo"
                          value={profileData.phoneNo}
                          onChange={(e) => handleProfileChange("phoneNo", e.target.value)}
                          placeholder="Enter your phone number"
                        />
                        <p className="text-xs text-muted-foreground">
                          We'll use this to contact you about your volunteer work
                        </p>
                      </div>

                      {/* Email (Read-only) */}
                      {/* <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          value={currentUser.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed. Contact support if you need to update it.
                        </p>
                      </div> */}

                      {/* Role (Read-only) */}
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium">
                          Specialization
                        </Label>
                        <Input
                          id="role"
                          value={currentUser.role}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="min-w-32 text-white"
                        >
                          {isLoading ? "Updating..." : "Update Profile"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-6">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                            className="pl-10 pr-10"
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                            className="pl-10 pr-10"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            className="pl-10 pr-10"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-amber-800">
                              Password Requirements
                            </p>
                            <ul className="text-xs text-amber-700 list-disc list-inside space-y-1">
                              <li>At least 8 characters long</li>
                              <li>Contains at least one uppercase letter</li>
                              <li>Contains at least one lowercase letter</li>
                              <li>Contains at least one number</li>
                              <li>Matches in both fields</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="min-w-32"
                        >
                          {isLoading ? "Updating..." : "Change Password"}
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