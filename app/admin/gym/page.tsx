"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchGymSettings,
  createGymSettings,
  updateGymSettings,
  type GymSettings,
  type GymSettingsInput,
} from "./actions";
import {
  Globe,
  Phone,
  Save,
  Building2,
  Camera,
  Share2,
  Play,
  MessageCircle,
} from "lucide-react";

export default function GymSettingsPage() {
  const [settings, setSettings] = React.useState<GymSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [gymName, setGymName] = React.useState("");
  const [gymDescription, setGymDescription] = React.useState("");
  const [registrationAmount, setRegistrationAmount] = React.useState("0");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [facebookUrl, setFacebookUrl] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const result = await fetchGymSettings();
        if (result.success) {
          setSettings(result.data ?? null);
          if (result.data) {
            setGymName(result.data.gymName);
            setGymDescription(result.data.gymDescription ?? "");
            setRegistrationAmount(result.data.registrationAmount);
            setPhone(result.data.phone ?? "");
            setEmail(result.data.email ?? "");
            setAddress(result.data.address ?? "");
            setWebsiteUrl(result.data.websiteUrl ?? "");
            setInstagramUrl(result.data.instagramUrl ?? "");
            setFacebookUrl(result.data.facebookUrl ?? "");
            setYoutubeUrl(result.data.youtubeUrl ?? "");
            setWhatsappNumber(result.data.whatsappNumber ?? "");
          }
        } else {
          setError(result.error || "Failed to load gym settings");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gymName.trim()) {
      toast.error("Gym name is required");
      return;
    }

    const payload: GymSettingsInput = {
      gymName: gymName.trim(),
      gymDescription: gymDescription.trim() || undefined,
      registrationAmount,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      facebookUrl: facebookUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
    };

    setSaving(true);
    try {
      if (settings) {
        const result = await updateGymSettings(payload);
        if (result.data) setSettings(result.data);
      } else {
        const result = await createGymSettings(payload);
        if (result.data) setSettings(result.data);
      }
      toast.success("Gym settings saved successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save gym settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Gym Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your gym&apos;s basic details and contact information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Basic Information
              </CardTitle>
              <CardDescription>
                General details about your gym.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gymName">Gym Name *</Label>
                <Input
                  id="gymName"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="e.g., FitZone Gym"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gymDescription">Description</Label>
                <Textarea
                  id="gymDescription"
                  value={gymDescription}
                  onChange={(e) => setGymDescription(e.target.value)}
                  placeholder="A brief description about your gym"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registrationAmount">
                  Registration Amount (₹)
                </Label>
                <Input
                  id="registrationAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={registrationAmount}
                  onChange={(e) => setRegistrationAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How members can reach your gym.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@yourgym.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full gym address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Online Presence
              </CardTitle>
              <CardDescription>
                Your gym&apos;s website and social media links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="websiteUrl" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourgym.com"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="instagramUrl"
                  className="flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourgym"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="facebookUrl"
                  className="flex items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Facebook
                </Label>
                <Input
                  id="facebookUrl"
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourgym"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="youtubeUrl"
                  className="flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  YouTube
                </Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@yourgym"
                />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label
                  htmlFor="whatsappNumber"
                  className="flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-background shadow-sm">
              <div className="p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
