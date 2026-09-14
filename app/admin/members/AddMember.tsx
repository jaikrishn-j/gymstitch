"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BloodGroup } from "@/types"
import { createMember } from "./actions"
import { useMemberRefresh } from "./member-context"

const COUNTRIES = [
  { code: "+91", name: "India" },
  { code: "+1", name: "United States" },
  { code: "+44", name: "United Kingdom" },
  { code: "+971", name: "UAE" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+61", name: "Australia" },
  { code: "+65", name: "Singapore" },
  { code: "+974", name: "Qatar" },
  { code: "+968", name: "Oman" },
  { code: "+965", name: "Kuwait" },
  { code: "+973", name: "Bahrain" },
  { code: "+63", name: "Philippines" },
  { code: "+60", name: "Malaysia" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+880", name: "Bangladesh" },
  { code: "+977", name: "Nepal" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+81", name: "Japan" },
  { code: "+86", name: "China" },
  { code: "+27", name: "South Africa" },
  { code: "+55", name: "Brazil" },
  { code: "+52", name: "Mexico" },
  { code: "+234", name: "Nigeria" },
  { code: "+254", name: "Kenya" },
  { code: "+20", name: "Egypt" },
  { code: "+90", name: "Turkey" },
  { code: "+39", name: "Italy" },
  { code: "+34", name: "Spain" },
  { code: "+31", name: "Netherlands" },
  { code: "+46", name: "Sweden" },
  { code: "+47", name: "Norway" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
  { code: "+32", name: "Belgium" },
  { code: "+353", name: "Ireland" },
  { code: "+64", name: "New Zealand" },
  { code: "+82", name: "South Korea" },
  { code: "+886", name: "Taiwan" },
  { code: "+852", name: "Hong Kong" },
]

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
  "Lakshadweep", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
]

function getStatesForCountry(country: string): string[] {
  if (country === "India") return INDIAN_STATES
  return ["Other"]
}

export const AddMember = () => {
  const refresh = useMemberRefresh()
  const [sameAddress, setSameAddress] = useState(false)
  const [homeCountry, setHomeCountry] = useState("India")
  const [homeState, setHomeState] = useState("")
  const [currentState, setCurrentState] = useState("")
  const [currentCountry, setCurrentCountry] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const homeStates = getStatesForCountry(homeCountry)
  const currentStates = getStatesForCountry(currentCountry || homeCountry)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === "string") data[key] = value
    })

    setLoading(true)
    try {
      await createMember(data as any)
      setOpen(false)
      form.reset()
      setHomeState("")
      setCurrentState("")
      setCurrentCountry("")
      setBloodGroup("")
      setSameAddress(false)
      refresh()
    } catch (error: any) {
      // error handled by form or toast if needed
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <span className="mr-1 text-base leading-none">+</span>
            New Member
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Create a member account with their personal details. A temporary password will be generated and email verified automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Basic Information</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Contact Details</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Home Address */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Home / Residential Address</h4>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="homeStreet">Street Address</Label>
                  <Input id="homeStreet" name="homeStreet" placeholder="123 Main Street" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="homeCity">City</Label>
                    <Input id="homeCity" name="homeCity" placeholder="Mumbai" />
                  </div>
                  <div className="grid gap-2">
                    <Label>State</Label>
                    <Select value={homeState} onValueChange={(v) => setHomeState(v ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {homeStates.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="homeState" value={homeState} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="homePostalCode">Postal Code</Label>
                    <Input id="homePostalCode" name="homePostalCode" placeholder="400001" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <Select value={homeCountry} onValueChange={(v) => { setHomeCountry(v ?? "India"); setHomeState("") }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="homeCountry" value={homeCountry} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="homeLandmark">Landmark (Optional)</Label>
                  <Input id="homeLandmark" name="homeLandmark" placeholder="Near city park" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Current Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Current Living Address</h4>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Same as home address
                </label>
              </div>
              {!sameAddress && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentStreet">Street Address</Label>
                    <Input id="currentStreet" name="currentStreet" placeholder="123 Main Street" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="currentCity">City</Label>
                      <Input id="currentCity" name="currentCity" placeholder="Mumbai" />
                    </div>
                    <div className="grid gap-2">
                      <Label>State</Label>
                      <Select value={currentState} onValueChange={(v) => setCurrentState(v ?? "")}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentStates.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="currentState" value={currentState} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="currentPostalCode">Postal Code</Label>
                      <Input id="currentPostalCode" name="currentPostalCode" placeholder="400001" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Country</Label>
                      <Select value={currentCountry} onValueChange={(v) => { setCurrentCountry(v ?? ""); setCurrentState("") }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="currentCountry" value={currentCountry} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currentLandmark">Landmark (Optional)</Label>
                    <Input id="currentLandmark" name="currentLandmark" placeholder="Near city park" />
                  </div>
                </div>
              )}
              {sameAddress && (
                <>
                  <input type="hidden" name="currentStreet" value="" />
                  <input type="hidden" name="currentCity" value="" />
                  <input type="hidden" name="currentState" value="" />
                  <input type="hidden" name="currentPostalCode" value="" />
                  <input type="hidden" name="currentCountry" value="" />
                  <input type="hidden" name="currentLandmark" value="" />
                </>
              )}
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Emergency Contact</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input id="emergencyContactName" name="emergencyContactName" placeholder="Jane Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Input id="emergencyContactRelation" name="emergencyContactRelation" placeholder="Spouse" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emergencyContactPhone">Emergency Phone</Label>
                <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" placeholder="+91 9876543210" />
              </div>
            </div>

            <Separator />

            {/* Optional Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Additional Information</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" name="height" type="number" placeholder="175" />
                </div>
                <div className="grid gap-2">
                  <Label>Blood Group</Label>
                  <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BloodGroup).map(([key, value]) => (
                        <SelectItem key={key} value={value}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="bloodGroup" value={bloodGroup} />
                </div>
              </div>
            </div>

          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/40">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMember
