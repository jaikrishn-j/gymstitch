import { UserProfile, UserRole } from "@/types";
import { PermissionLevel, PermissionModule } from "@/types/permissions";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, RedirectType } from "next/navigation";

export async function checkUserType(
    allowedRoles: UserRole[], 
    noRedirect: boolean = false // Changed to lowercase 'boolean' type & fixed camelCase name
): Promise<UserProfile | null> {
    const { userId } = await auth();
    
    if (!userId) {
        if (noRedirect) return null;
        redirect("/login", RedirectType.replace); // Next.js redirect doesn't need to be returned
    }

    const rolesToCheck = allowedRoles ?? [];

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    let userRole = user.privateMetadata?.role as UserRole;

    if(!userRole){
        userRole = UserRole.MEMBER
        await client.users.updateUserMetadata(userId, {
            privateMetadata:{
                role: userRole
            }
        })
    }

    if (!rolesToCheck.includes(userRole)) {
        console.log("❌ ROLE CHECK FAILED");
        console.log("userRole:", userRole);
        console.log("allowedRoles:", rolesToCheck);
        console.log("noRedirect:", noRedirect);

        if (noRedirect) return null;
        console.log("🚨 ABOUT TO REDIRECT TO /404");

        redirect("/404", RedirectType.replace); // Next.js redirect halts execution completely
    }

    return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "", // Corrected array structure mapping
        firstName: user.firstName,
        lastname: user.lastName, // Kept 'lastname' as per your interface structure
        imageUrl: user.imageUrl,
        role: userRole
    };
}

export async function redirectByRole(currentPath:string,allowedRoles: UserRole[] = [], noRedirect: boolean = false):Promise<UserProfile | void>{
    const user: UserProfile | null = await checkUserType(allowedRoles,noRedirect)

    if(user?.role === UserRole.ADMIN){
        if(currentPath.startsWith("/admin")){
            return user;
        }
        return redirect("/admin/dashboard", RedirectType.replace)
    }
    if(user?.role === UserRole.STAFF){
        if(currentPath.startsWith("/staff")){
            return user;
        }
        return redirect("/staff/dashboard", RedirectType.replace)
    }
    if(user?.role === UserRole.MEMBER){
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(user.id)
        const metadata = clerkUser.privateMetadata || {}

        const requiredFields = [
            "phone",
            "residentialAddress",
            "currentAddress",
            "emergencyContactName",
            "emergencyContactRelation",
            "emergencyContactPhone"
        ];

        const isProfileComplete = requiredFields.every((field)=> {
            const value = metadata[field]
            if(value === undefined || value === null || value === "") return false

            if(typeof value === "object" && Object.keys(value).length === 0) return false
            return true
        })

        const isOnboarding = currentPath.startsWith("/onboarding")

        if(!isProfileComplete){
            if(isOnboarding) return user;
            return redirect("/onboarding", RedirectType.replace)
        }

        if (currentPath.startsWith("/admin") || currentPath.startsWith("/staff")) {
            return redirect("/dashboard", RedirectType.replace);
        }
        return user
    }
}

export async function checkUserRole(
    module: PermissionModule,
    level: PermissionLevel
):Promise<boolean>{
    const {userId} = await auth()
    if(!userId) redirect("/login", RedirectType.replace)

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const userRole = user.privateMetadata?.role as UserRole

    if(userRole !== UserRole.STAFF){
        return false
    }

    const permission = user.privateMetadata?.permission as | {name: string}[] | undefined

    if(!permission){
        return false
    }

    const requiredPermission = `${module}:${level}`

    return permission.some(
        (permission) => permission.name === requiredPermission
    )
}