"use client";

import { useState } from "react";
import { useActionState } from "react";
import { CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BloodGroup } from "@/types";
import type { OnboardingFormState } from "./actions";

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
];

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
];

const COUNTRY_OPTIONS = COUNTRIES.map((c) => `${c.code} (${c.name})`);

function getStatesForCountry(country: string): string[] {
    if (country === "India") return INDIAN_STATES;
    return ["Other"];
}

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCountryCode: string;
    sameWhatsapp: boolean;
    whatsapp: string;
    whatsappCountryCode: string;
    homeStreet: string;
    homeCity: string;
    homeState: string;
    homePostalCode: string;
    homeCountry: string;
    homeLandmark: string;
    sameAddress: boolean;
    currentStreet: string;
    currentCity: string;
    currentState: string;
    currentPostalCode: string;
    currentCountry: string;
    currentLandmark: string;
    emergencyContactName: string;
    emergencyContactRelation: string;
    emergencyContactPhone: string;
    emergencyPhoneCountryCode: string;
    height: string;
    bloodGroup: string;
}

interface OnboardingFormProps {
    totalSteps: number;
    initialState: FormState;
    processOnboardingStep: (prevState: OnboardingFormState, formData: FormData) => Promise<OnboardingFormState>;
}

const STEP_TITLES = [
    "Basic Information",
    "Contact Details",
    "Addresses",
    "Emergency Contact",
    "Optional Information",
];

const STEP_DESCRIPTIONS = [
    "Confirm your identity and basic account details.",
    "Enter your primary mobile and communication numbers.",
    "Provide your permanent and current living addresses.",
    "Who should we notify in case of an emergency?",
    "Additional health and physical details.",
];

export function OnboardingForm({
    totalSteps,
    initialState,
    processOnboardingStep,
}: OnboardingFormProps) {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<FormState>(initialState);
    const [formState, formAction, isPending] = useActionState(processOnboardingStep, {});
    const [validationError, setValidationError] = useState<string | null>(null);

    const progressPercentage = Math.round((step / totalSteps) * 100);

    const update = (patch: Partial<FormState>) => setState((prev) => ({ ...prev, ...patch }));

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        update({
            phone: val,
            whatsapp: state.sameWhatsapp ? val : state.whatsapp,
        });
    };

    const handlePhoneCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        update({
            phoneCountryCode: val,
            whatsappCountryCode: state.sameWhatsapp ? val : state.whatsappCountryCode,
        });
    };

    const handleSameWhatsappToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        update({
            sameWhatsapp: checked,
            whatsapp: checked ? state.phone : state.whatsapp,
            whatsappCountryCode: checked ? state.phoneCountryCode : state.whatsappCountryCode,
        });
    };

    const handleSameAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        update({
            sameAddress: checked,
            currentStreet: checked ? state.homeStreet : state.currentStreet,
            currentCity: checked ? state.homeCity : state.currentCity,
            currentState: checked ? state.homeState : state.currentState,
            currentPostalCode: checked ? state.homePostalCode : state.currentPostalCode,
            currentCountry: checked ? state.homeCountry : state.currentCountry,
            currentLandmark: checked ? state.homeLandmark : state.currentLandmark,
        });
    };

    const handleHomeCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        const states = getStatesForCountry(country);
        update({
            homeCountry: country,
            homeState: states.includes(state.homeState) ? state.homeState : states[0],
        });
    };

    const handleCurrentCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        const states = getStatesForCountry(country);
        update({
            currentCountry: country,
            currentState: states.includes(state.currentState) ? state.currentState : states[0],
        });
    };

    const validateCurrentStep = (): boolean => {
        switch (step) {
            case 1:
                return state.firstName.trim() !== "" && state.lastName.trim() !== "";
            case 2:
                return state.phone.trim() !== "";
            case 3:
                return (
                    state.homeStreet.trim() !== "" &&
                    state.homeCity.trim() !== "" &&
                    state.homePostalCode.trim() !== "" &&
                    state.homeCountry.trim() !== ""
                );
            case 4:
                return (
                    state.emergencyContactName.trim() !== "" &&
                    state.emergencyContactRelation.trim() !== "" &&
                    state.emergencyContactPhone.trim() !== ""
                );
            default:
                return true;
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (step < totalSteps) {
            if (validateCurrentStep()) {
                setStep((s) => s + 1);
            } else {
                setValidationError("Please fill in all required fields before proceeding.");
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep((s) => s - 1);
    };

    return (
        <Card className="border-border/60 shadow-2xl backdrop-blur-xl bg-card/80 sm:rounded-2xl transition-all">
            {/* Visual Step Nodes */}
            <div className="flex items-center justify-between px-6 pt-6">
                {Array.from({ length: totalSteps }).map((_, i) => {
                    const stepNum = i + 1;
                    const isCompleted = stepNum < step;
                    const isCurrent = stepNum === step;
                    return (
                        <div key={stepNum} className="flex items-center gap-2">
                            <div
                                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-semibold tracking-wider transition-all duration-300 ${
                                    isCurrent
                                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105 shadow-md"
                                        : isCompleted
                                        ? "bg-primary/20 text-primary border border-primary/40"
                                        : "bg-muted/80 text-muted-foreground border border-border/50"
                                }`}
                            >
                                {isCompleted ? "✓" : stepNum}
                            </div>
                            {stepNum < totalSteps && (
                                <div
                                    className={`hidden sm:block h-0.5 w-8 lg:w-12 transition-colors duration-300 ${
                                        stepNum < step ? "bg-primary" : "bg-border/60"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <CardHeader className="space-y-4 pb-5 border-b border-border/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        STEP {step} OF {totalSteps}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground font-mono text-[11px] border border-border/40">
                        {progressPercentage}% COMPLETED
                    </span>
                </div>
                <Progress value={progressPercentage} className="h-1.5 bg-muted/60" />
                <div className="space-y-1">
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                        {STEP_TITLES[step - 1]}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                        {STEP_DESCRIPTIONS[step - 1]}
                    </CardDescription>
                </div>
            </CardHeader>

            <form action={(formData) => {
                if (step === totalSteps) {
                    formAction(formData);
                }
            }}>
                <input type="hidden" name="firstName" value={state.firstName} />
                <input type="hidden" name="lastName" value={state.lastName} />
                <input type="hidden" name="email" value={state.email} />
                <input type="hidden" name="phone" value={`${state.phoneCountryCode}${state.phone}`} />
                <input type="hidden" name="whatsapp" value={`${state.whatsappCountryCode}${state.whatsapp}`} />
                <input type="hidden" name="homeStreet" value={state.homeStreet} />
                <input type="hidden" name="homeCity" value={state.homeCity} />
                <input type="hidden" name="homeState" value={state.homeState} />
                <input type="hidden" name="homePostalCode" value={state.homePostalCode} />
                <input type="hidden" name="homeCountry" value={state.homeCountry} />
                <input type="hidden" name="homeLandmark" value={state.homeLandmark} />
                <input type="hidden" name="currentStreet" value={state.currentStreet} />
                <input type="hidden" name="currentCity" value={state.currentCity} />
                <input type="hidden" name="currentState" value={state.currentState} />
                <input type="hidden" name="currentPostalCode" value={state.currentPostalCode} />
                <input type="hidden" name="currentCountry" value={state.currentCountry} />
                <input type="hidden" name="currentLandmark" value={state.currentLandmark} />
                <input type="hidden" name="emergencyContactName" value={state.emergencyContactName} />
                <input type="hidden" name="emergencyContactRelation" value={state.emergencyContactRelation} />
                <input type="hidden" name="emergencyContactPhone" value={`${state.emergencyPhoneCountryCode}${state.emergencyContactPhone}`} />
                <input type="hidden" name="height" value={state.height} />
                <input type="hidden" name="bloodGroup" value={state.bloodGroup} />

                <CardContent className="pt-6 space-y-5">
                    {formState.error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                            {formState.error}
                        </div>
                    )}
                    {validationError && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                            {validationError}
                        </div>
                    )}

                    {/* STEP 1: PREFILLED IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={state.firstName}
                                        onChange={(e) => update({ firstName: e.target.value })}
                                        required
                                        className="h-11 sm:h-10 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={state.lastName}
                                        onChange={(e) => update({ lastName: e.target.value })}
                                        required
                                        className="h-11 sm:h-10 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    value={state.email}
                                    readOnly
                                    className="h-11 sm:h-10 bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed select-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONTACT DETAILS */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Phone Number
                                </Label>
                                <div className="flex gap-2">
                                    <select
                                        value={state.phoneCountryCode}
                                        onChange={handlePhoneCountryCodeChange}
                                        className="h-11 sm:h-10 w-28 sm:w-32 rounded-md border border-border/80 bg-muted/20 px-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.code} ({c.name})
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        id="phone"
                                        value={state.phone}
                                        onChange={handlePhoneChange}
                                        placeholder="9876543210"
                                        required
                                        className="h-11 sm:h-10 flex-1 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    WhatsApp Number
                                </Label>
                                <div className="flex gap-2">
                                    <select
                                        value={state.whatsappCountryCode}
                                        onChange={(e) => update({ whatsappCountryCode: e.target.value })}
                                        disabled={state.sameWhatsapp}
                                        className="h-11 sm:h-10 w-28 sm:w-32 rounded-md border border-border/80 bg-muted/20 px-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.code} ({c.name})
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        id="whatsapp"
                                        value={state.whatsapp}
                                        onChange={(e) => update({ whatsapp: e.target.value })}
                                        disabled={state.sameWhatsapp}
                                        placeholder="9876543210"
                                        className="h-11 sm:h-10 flex-1 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3.5 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/30 transition-colors">
                                <input
                                    type="checkbox"
                                    id="sameWhatsapp"
                                    checked={state.sameWhatsapp}
                                    onChange={handleSameWhatsappToggle}
                                    className="h-4 w-4 rounded border-input text-primary accent-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                                <Label htmlFor="sameWhatsapp" className="text-xs sm:text-sm font-medium cursor-pointer select-none">
                                    Same as primary phone number
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ADDRESS DETAILS */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in-50 duration-300">
                            <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-muted/10 shadow-sm">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Home / Residential Address
                                </h4>
                                <div className="space-y-2">
                                    <Label htmlFor="homeStreet" className="text-xs font-medium text-muted-foreground">Street Address</Label>
                                    <Input
                                        id="homeStreet"
                                        value={state.homeStreet}
                                        onChange={(e) => update({ homeStreet: e.target.value })}
                                        required
                                        className="h-10 sm:h-9 text-sm bg-background/80"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="homeCity" className="text-xs font-medium text-muted-foreground">City</Label>
                                        <Input
                                            id="homeCity"
                                            value={state.homeCity}
                                            onChange={(e) => update({ homeCity: e.target.value })}
                                            required
                                            className="h-10 sm:h-9 text-sm bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="homeState" className="text-xs font-medium text-muted-foreground">State</Label>
                                        <select
                                            id="homeState"
                                            value={state.homeState}
                                            onChange={(e) => update({ homeState: e.target.value })}
                                            required
                                            className="flex h-10 sm:h-9 w-full rounded-md border border-border/80 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                        >
                                            {getStatesForCountry(state.homeCountry).map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="homePostalCode" className="text-xs font-medium text-muted-foreground">Postal Code</Label>
                                        <Input
                                            id="homePostalCode"
                                            value={state.homePostalCode}
                                            onChange={(e) => update({ homePostalCode: e.target.value })}
                                            required
                                            className="h-10 sm:h-9 text-sm bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="homeCountry" className="text-xs font-medium text-muted-foreground">Country</Label>
                                        <select
                                            id="homeCountry"
                                            value={state.homeCountry}
                                            onChange={handleHomeCountryChange}
                                            required
                                            className="flex h-10 sm:h-9 w-full rounded-md border border-border/80 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="homeLandmark" className="text-xs font-medium text-muted-foreground">Landmark (Optional)</Label>
                                    <Input
                                        id="homeLandmark"
                                        value={state.homeLandmark}
                                        onChange={(e) => update({ homeLandmark: e.target.value })}
                                        className="h-10 sm:h-9 text-sm bg-background/80"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-muted/10 shadow-sm">
                                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 flex-wrap">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                        Current Living Address
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sameAddress"
                                            checked={state.sameAddress}
                                            onChange={handleSameAddressToggle}
                                            className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                                        />
                                        <Label htmlFor="sameAddress" className="text-xs font-medium cursor-pointer select-none text-muted-foreground">
                                            Same as home address
                                        </Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentStreet" className="text-xs font-medium text-muted-foreground">Street Address</Label>
                                    <Input
                                        id="currentStreet"
                                        value={state.sameAddress ? state.homeStreet : state.currentStreet}
                                        onChange={(e) => update({ currentStreet: e.target.value })}
                                        disabled={state.sameAddress}
                                        className="h-10 sm:h-9 text-sm bg-background/80 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCity" className="text-xs font-medium text-muted-foreground">City</Label>
                                        <Input
                                            id="currentCity"
                                            value={state.sameAddress ? state.homeCity : state.currentCity}
                                            onChange={(e) => update({ currentCity: e.target.value })}
                                            disabled={state.sameAddress}
                                            className="h-10 sm:h-9 text-sm bg-background/80 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentState" className="text-xs font-medium text-muted-foreground">State</Label>
                                        <select
                                            id="currentState"
                                            value={state.sameAddress ? state.homeState : state.currentState}
                                            onChange={(e) => update({ currentState: e.target.value })}
                                            disabled={state.sameAddress}
                                            required
                                            className="flex h-10 sm:h-9 w-full rounded-md border border-border/80 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                        >
                                            {getStatesForCountry(state.sameAddress ? state.homeCountry : state.currentCountry).map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPostalCode" className="text-xs font-medium text-muted-foreground">Postal Code</Label>
                                        <Input
                                            id="currentPostalCode"
                                            value={state.sameAddress ? state.homePostalCode : state.currentPostalCode}
                                            onChange={(e) => update({ currentPostalCode: e.target.value })}
                                            disabled={state.sameAddress}
                                            className="h-10 sm:h-9 text-sm bg-background/80 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCountry" className="text-xs font-medium text-muted-foreground">Country</Label>
                                        <select
                                            id="currentCountry"
                                            value={state.sameAddress ? state.homeCountry : state.currentCountry}
                                            onChange={handleCurrentCountryChange}
                                            disabled={state.sameAddress}
                                            required
                                            className="flex h-10 sm:h-9 w-full rounded-md border border-border/80 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentLandmark" className="text-xs font-medium text-muted-foreground">Landmark (Optional)</Label>
                                    <Input
                                        id="currentLandmark"
                                        value={state.sameAddress ? state.homeLandmark : state.currentLandmark}
                                        onChange={(e) => update({ currentLandmark: e.target.value })}
                                        disabled={state.sameAddress}
                                        className="h-10 sm:h-9 text-sm bg-background/80 disabled:bg-muted/50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: EMERGENCY CONTACT */}
                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactName" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Emergency Contact Name</Label>
                                <Input
                                    id="emergencyContactName"
                                    value={state.emergencyContactName}
                                    onChange={(e) => update({ emergencyContactName: e.target.value })}
                                    required
                                    className="h-11 sm:h-10 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactRelation" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Relationship</Label>
                                <Input
                                    id="emergencyContactRelation"
                                    value={state.emergencyContactRelation}
                                    onChange={(e) => update({ emergencyContactRelation: e.target.value })}
                                    placeholder="e.g. Father, Spouse, Sister"
                                    required
                                    className="h-11 sm:h-10 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactPhone" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Emergency Phone Number</Label>
                                <div className="flex gap-2">
                                    <select
                                        value={state.emergencyPhoneCountryCode}
                                        onChange={(e) => update({ emergencyPhoneCountryCode: e.target.value })}
                                        className="h-11 sm:h-10 w-28 sm:w-32 rounded-md border border-border/80 bg-muted/20 px-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.code} ({c.name})
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        id="emergencyContactPhone"
                                        value={state.emergencyContactPhone}
                                        onChange={(e) => update({ emergencyContactPhone: e.target.value })}
                                        placeholder="9876543210"
                                        required
                                        className="h-11 sm:h-10 flex-1 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: OPTIONAL DATA */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="bloodGroup" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Blood Group</Label>
                                <select
                                    id="bloodGroup"
                                    value={state.bloodGroup}
                                    onChange={(e) => update({ bloodGroup: e.target.value })}
                                    className="flex h-11 sm:h-10 w-full rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-sm shadow-sm transition-all focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                >
                                    <option value="">Select blood group (Optional)</option>
                                    {Object.entries(BloodGroup).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Height (in cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={state.height}
                                    onChange={(e) => update({ height: e.target.value })}
                                    placeholder="e.g. 175"
                                    className="h-11 sm:h-10 bg-muted/20 border-border/80 focus:bg-background transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3 pt-6 border-t border-border/40 mt-4">
                    {step > 1 ? (
                        <Button
                            type="button"
                            onClick={handleBack}
                            variant="outline"
                            className="w-28 sm:w-32 h-11 sm:h-10 font-medium transition-all hover:bg-muted active:scale-[0.98]"
                        >
                            ← Back
                        </Button>
                    ) : <div />}

                    {step < totalSteps ? (
                        <Button
                            type="button"
                            onClick={(e) => handleNext(e)}
                            className="w-32 sm:w-36 h-11 sm:h-10 font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            Next Step →
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-40 sm:w-44 h-11 sm:h-10 font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPending ? "Submitting..." : "Submit & Finish ✓"}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
