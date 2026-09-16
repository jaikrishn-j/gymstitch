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
import { Field, FieldGroup } from "@/components/ui/field"
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
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
  "Lakshadweep",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
]

const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Member identity and contact details",
  },
  {
    id: 2,
    title: "Address Details",
    description: "Residential and current address",
  },
  {
    id: 3,
    title: "Emergency Contact",
    description: "Primary emergency contact",
  },
  {
    id: 4,
    title: "Additional Details",
    description: "Physical and health details",
  },
]

function getStatesForCountry(country: string): string[] {
  return country === "India" ? INDIAN_STATES : ["Other"]
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  homeStreet: "",
  homeCity: "",
  homePostalCode: "",
  homeLandmark: "",
  currentStreet: "",
  currentCity: "",
  currentPostalCode: "",
  currentLandmark: "",
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
  height: "",
}

export const AddMember = () => {
  const refresh = useMemberRefresh()
  const [currentStep, setCurrentStep] = useState(1)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(initialFormData)
  const [sameAddress, setSameAddress] = useState(false)
  const [homeCountry, setHomeCountry] = useState("India")
  const [homeState, setHomeState] = useState("")
  const [currentState, setCurrentState] = useState("")
  const [currentCountry, setCurrentCountry] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")

  const homeStates = getStatesForCountry(homeCountry)
  const currentStates = getStatesForCountry(currentCountry || homeCountry)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData(initialFormData)
    setHomeState("")
    setCurrentState("")
    setCurrentCountry("")
    setHomeCountry("India")
    setBloodGroup("")
    setSameAddress(false)
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (currentStep < STEPS.length) {
      handleNext()
      return
    }

    setLoading(true)

    const payload = {
      ...formData,
      homeCountry,
      homeState,
      currentCountry: sameAddress ? homeCountry : currentCountry,
      currentState: sameAddress ? homeState : currentState,
      currentStreet: sameAddress
        ? formData.homeStreet
        : formData.currentStreet,
      currentCity: sameAddress ? formData.homeCity : formData.currentCity,
      currentPostalCode: sameAddress
        ? formData.homePostalCode
        : formData.currentPostalCode,
      currentLandmark: sameAddress
        ? formData.homeLandmark
        : formData.currentLandmark,
      bloodGroup,
    }

    try {
      await createMember(payload as any)
      setOpen(false)
      resetForm()
      refresh()
    } catch (error: any) {
      // Error handling remains delegated to the existing parent/toast flow.
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) resetForm()
      }}
    >
      <DialogTrigger render={<Button size="sm">+ New Member</Button>} />

      <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex max-h-[calc(100vh-4rem)] flex-col"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Complete the member profile in a few simple steps.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 min-h-0 overflow-y-auto pr-1">
            {/* Step indicator */}
            <div className="flex items-start">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id
                const isComplete = currentStep > step.id

                return (
                  <div
                    key={step.id}
                    className="flex flex-1 items-start last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={[
                          "flex size-8 items-center justify-center rounded-full border text-sm font-medium",
                          isActive || isComplete
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/25 bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {isComplete ? "✓" : step.id}
                      </div>

                      <div className="hidden text-center sm:block">
                        <p
                          className={[
                            "text-xs font-medium",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>

                    {index < STEPS.length - 1 && (
                      <Separator
                        className={[
                          "mx-2 mt-4 flex-1",
                          currentStep > step.id
                            ? "bg-primary"
                            : "bg-border",
                        ].join(" ")}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 rounded-lg border bg-card p-5">
              <div className="mb-5">
                <p className="text-sm font-medium">
                  Step {currentStep} of {STEPS.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>

              {/* Step 1 */}
              {currentStep === 1 && (
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <FieldGroup>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">
                        Home / Residential Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Where the member permanently resides.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <Label htmlFor="homeStreet">Street Address</Label>
                        <Input
                          id="homeStreet"
                          name="homeStreet"
                          value={formData.homeStreet}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                        />
                      </Field>

                      <Field>
                        <Label htmlFor="homeCity">City</Label>
                        <Input
                          id="homeCity"
                          name="homeCity"
                          value={formData.homeCity}
                          onChange={handleInputChange}
                          placeholder="Mumbai"
                        />
                      </Field>

                      <Field>
                        <Label>State</Label>
                        <Select
                          value={homeState}
                          onValueChange={(value) => setHomeState(value ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {homeStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <Label htmlFor="homePostalCode">Postal Code</Label>
                        <Input
                          id="homePostalCode"
                          name="homePostalCode"
                          value={formData.homePostalCode}
                          onChange={handleInputChange}
                          placeholder="400001"
                        />
                      </Field>

                      <Field>
                        <Label>Country</Label>
                        <Select
                          value={homeCountry}
                          onValueChange={(value) => {
                            setHomeCountry(value ?? "India")
                            setHomeState("")
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem
                                key={country.name}
                                value={country.name}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className="sm:col-span-2">
                        <Label htmlFor="homeLandmark">
                          Landmark (Optional)
                        </Label>
                        <Input
                          id="homeLandmark"
                          name="homeLandmark"
                          value={formData.homeLandmark}
                          onChange={handleInputChange}
                          placeholder="Near city park"
                        />
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-medium">
                          Current Living Address
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          The address where the member currently lives.
                        </p>
                      </div>

                      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={sameAddress}
                          onChange={(e) => setSameAddress(e.target.checked)}
                          className="size-4 rounded border-input"
                        />
                        Same as home
                      </label>
                    </div>

                    {!sameAddress && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field className="sm:col-span-2">
                          <Label htmlFor="currentStreet">
                            Street Address
                          </Label>
                          <Input
                            id="currentStreet"
                            name="currentStreet"
                            value={formData.currentStreet}
                            onChange={handleInputChange}
                            placeholder="123 Main Street"
                          />
                        </Field>

                        <Field>
                          <Label htmlFor="currentCity">City</Label>
                          <Input
                            id="currentCity"
                            name="currentCity"
                            value={formData.currentCity}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                          />
                        </Field>

                        <Field>
                          <Label>State</Label>
                          <Select
                            value={currentState}
                            onValueChange={(value) =>
                              setCurrentState(value ?? "")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <Label htmlFor="currentPostalCode">
                            Postal Code
                          </Label>
                          <Input
                            id="currentPostalCode"
                            name="currentPostalCode"
                            value={formData.currentPostalCode}
                            onChange={handleInputChange}
                            placeholder="400001"
                          />
                        </Field>

                        <Field>
                          <Label>Country</Label>
                          <Select
                            value={currentCountry}
                            onValueChange={(value) => {
                              setCurrentCountry(value ?? "")
                              setCurrentState("")
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem
                                  key={country.name}
                                  value={country.name}
                                >
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field className="sm:col-span-2">
                          <Label htmlFor="currentLandmark">
                            Landmark (Optional)
                          </Label>
                          <Input
                            id="currentLandmark"
                            name="currentLandmark"
                            value={formData.currentLandmark}
                            onChange={handleInputChange}
                            placeholder="Near city park"
                          />
                        </Field>
                      </div>
                    )}

                    {sameAddress && (
                      <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                        The current address will use the home address.
                      </div>
                    )}
                  </div>
                </FieldGroup>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="emergencyContactName">
                        Contact Name
                      </Label>
                      <Input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        placeholder="Jane Doe"
                      />
                    </Field>

                    <Field>
                      <Label htmlFor="emergencyContactRelation">
                        Relationship
                      </Label>
                      <Input
                        id="emergencyContactRelation"
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={handleInputChange}
                        placeholder="Spouse"
                      />
                    </Field>

                    <Field className="sm:col-span-2">
                      <Label htmlFor="emergencyContactPhone">
                        Emergency Phone
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="175"
                      />
                    </Field>

                    <Field>
                      <Label>Blood Group</Label>
                      <Select
                        value={bloodGroup}
                        onValueChange={(value) =>
                          setBloodGroup(value ?? "")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BloodGroup || {}).map(
                            ([key, value]: [string, any]) => (
                              <SelectItem key={key} value={value}>
                                {value}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </FieldGroup>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 shrink-0 flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => setOpen(false) : handleBack}
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Member"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMember