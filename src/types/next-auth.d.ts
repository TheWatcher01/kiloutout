import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: "CLIENT" | "ADMIN";
            image?: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "CLIENT" | "ADMIN";
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "CLIENT" | "ADMIN";
        firstName: string;
        lastName: string;
        googleAccessToken?: string;
        googleRefreshToken?: string;
    }
}
