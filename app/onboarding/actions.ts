"use server";

import { redirect, RedirectType } from "next/navigation";
import { BloodGroup, MemberDetails } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";

export interface OnboardingFormState {
    error?: string;
}



export async function processOnboardingStep(
    _prevState: OnboardingFormState,
    formData: FormData
): Promise<OnboardingFormState> {
    const raw = {
        firstName: formData.get("firstName")?.toString() || "",
        lastName: formData.get("lastName")?.toString() || "",
        phone: formData.get("phone")?.toString() || "",
        whatsapp: formData.get("whatsapp")?.toString() || "",
        homeStreet: formData.get("homeStreet")?.toString() || "",
        homeCity: formData.get("homeCity")?.toString() || "",
        homeState: formData.get("homeState")?.toString() || "",
        homePostalCode: formData.get("homePostalCode")?.toString() || "",
        homeCountry: formData.get("homeCountry")?.toString() || "",
        homeLandmark: formData.get("homeLandmark")?.toString() || "",
        currentStreet: formData.get("currentStreet")?.toString() || "",
        currentCity: formData.get("currentCity")?.toString() || "",
        currentState: formData.get("currentState")?.toString() || "",
        currentPostalCode: formData.get("currentPostalCode")?.toString() || "",
        currentCountry: formData.get("currentCountry")?.toString() || "",
        currentLandmark: formData.get("currentLandmark")?.toString() || "",
        emergencyContactName: formData.get("emergencyContactName")?.toString() || "",
        emergencyContactRelation: formData.get("emergencyContactRelation")?.toString() || "",
        emergencyContactPhone: formData.get("emergencyContactPhone")?.toString() || "",
        height: formData.get("height")?.toString() || "",
        bloodGroup: formData.get("bloodGroup")?.toString() || "",
    };

    if (!raw.firstName || !raw.lastName || !raw.phone) {
        return { error: "First name, last name, and phone number are required." };
    }
    if (!raw.emergencyContactName || !raw.emergencyContactPhone) {
        return { error: "Emergency contact name and phone are required." };
    }

    const memberDetails: MemberDetails = {
        name: `${raw.firstName} ${raw.lastName}`.trim(),
        phone: raw.phone,
        whatsapp: raw.whatsapp || undefined,
        residentialAddress: {
            street: raw.homeStreet,
            city: raw.homeCity,
            state: raw.homeState,
            postalCode: raw.homePostalCode,
            country: raw.homeCountry,
            landmark: raw.homeLandmark || undefined,
        },
        currentAddress: {
            street: raw.currentStreet,
            city: raw.currentCity,
            state: raw.currentState,
            postalCode: raw.currentPostalCode,
            country: raw.currentCountry,
            landmark: raw.currentLandmark || undefined,
        },
        emergencyContactName: raw.emergencyContactName,
        emergencyContactRelation: raw.emergencyContactRelation,
        emergencyContactPhone: raw.emergencyContactPhone,
        height: raw.height ? Number(raw.height) : undefined,
        bloodGroup: (raw.bloodGroup as BloodGroup) || undefined,
    };

    const {userId} = await auth();
    if(!userId) return redirect("/login", RedirectType.replace)
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
        privateMetadata: {
            name: memberDetails.name,
            phone: memberDetails.phone,
            whatsapp: memberDetails.whatsapp,

            residentialAddress: memberDetails.residentialAddress,
            currentAddress: memberDetails.currentAddress,

            emergencyContactName: memberDetails.emergencyContactName,
            emergencyContactRelation: memberDetails.emergencyContactRelation,
            emergencyContactPhone: memberDetails.emergencyContactPhone,

            height: memberDetails.height,
            bloodGroup: memberDetails.bloodGroup,
        },
    });

    return redirect("/dashboard", RedirectType.replace);
}
