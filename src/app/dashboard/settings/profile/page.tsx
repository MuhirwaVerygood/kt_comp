"use client";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardGuard } from "@/components/DashboardGuard";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator as SidebarSeparator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Bell,
  CreditCard,
  Save,
  Camera,
  Key,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

export default function UserProfilePage() {
  const { data: profile, isLoading, mutate: refetchProfile } = useProfile<Profile>();
  const { trigger: updateProfile, isMutating: isUpdating } = useUpdateProfile();
  const { trigger: changePassword, isMutating: isChangingPassword } = useChangePassword();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update form when profile loads
  useEffect(() => {
    const profileData = (profile as any)?.data || profile;
    if (profileData?.name !== undefined) {
      setProfileForm({
        name: profileData.name || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
      });
    }
  }, [profile]);

  const profileData = (profile as any)?.data || profile;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      refetchProfile();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    if (securityForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    try {
      await changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      toast.success("Password updated successfully!");
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <AuthProvider>
      <DashboardGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <SidebarSeparator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard/settings">
                        Settings
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>User Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Profile</h1>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !profile ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Failed to load profile</p>
                </div>
              ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Header */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="relative mx-auto mb-4">
                        <Avatar className="w-24 h-24 mx-auto">
                          <AvatarImage src={profileData?.avatar || undefined} alt={profileData?.name || "User"} />
                          <AvatarFallback className="text-2xl">
                            {profileData?.name
                              ? profileData.name.split(" ").map((n: string) => n[0]).join("")
                              : profileData?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full p-2"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle>{profileData?.name || "User"}</CardTitle>
                      <CardDescription>{profileData?.role || "User"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{profileData?.email || "Not set"}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{profileData?.phone || "Not set"}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            Joined{" "}
                            {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        {profileData?.lastLogin && (
                          <div className="flex items-center">
                            <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              Last login:{" "}
                              {new Date(profileData.lastLogin).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Information */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and bio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profileForm.name}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileForm.bio}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                bio: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself"
                            rows={4}
                          />
                        </div>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Update your password and security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleSecurityUpdate}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={securityForm.currentPassword}
                            onChange={(e) =>
                              setSecurityForm({
                                ...securityForm,
                                currentPassword: e.target.value,
                              })
                            }
                            placeholder="Enter your current password"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={securityForm.newPassword}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Enter new password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={securityForm.confirmPassword}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </DashboardGuard>
    </AuthProvider>
  );
}
