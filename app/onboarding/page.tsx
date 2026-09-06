import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, RedirectType } from "next/navigation";

import { OnboardingForm } from "./onboarding-form";
import { processOnboardingStep } from "./actions";

export default async function OnboardingPage() {
    const { userId } = await auth();
    if (!userId) redirect("/login", RedirectType.replace);

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const initialState = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        phone: "",
        phoneCountryCode: "+91",
        sameWhatsapp: false,
        whatsapp: "",
        whatsappCountryCode: "+91",
        homeStreet: "",
        homeCity: "",
        homeState: "Kerala",
        homePostalCode: "",
        homeCountry: "India",
        homeLandmark: "",
        sameAddress: false,
        currentStreet: "",
        currentCity: "",
        currentState: "Kerala",
        currentPostalCode: "",
        currentCountry: "India",
        currentLandmark: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        emergencyPhoneCountryCode: "+91",
        height: "",
        bloodGroup: "",
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden bg-background">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl sm:max-w-2xl space-y-4">
                <OnboardingForm
                    totalSteps={5}
                    initialState={initialState}
                    processOnboardingStep={processOnboardingStep}
                />
            </div>
        </div>
    );
}
