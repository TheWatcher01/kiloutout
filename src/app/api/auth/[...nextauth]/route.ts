import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/logout",
        error: "/auth/error",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email et mot de passe requis");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase() },
                });

                if (!user) {
                    throw new Error("Identifiants incorrects");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Identifiants incorrects");
                }

                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    authorization: {
                        params: {
                            scope:
                                "openid email profile https://www.googleapis.com/auth/calendar",
                            access_type: "offline",
                            prompt: "consent",
                        },
                    },
                }),
            ]
            : []),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "CLIENT";
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
            }

            // Sauvegarder les tokens Google pour l'API Calendar
            if (account?.provider === "google") {
                token.googleAccessToken = account.access_token;
                token.googleRefreshToken = account.refresh_token;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // Pour Google OAuth, créer ou mettre à jour l'utilisateur
            if (account?.provider === "google" && profile?.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: profile.email },
                });

                if (!existingUser) {
                    // Créer un nouvel utilisateur depuis Google
                    await prisma.user.create({
                        data: {
                            email: profile.email,
                            password: "", // Pas de mot de passe pour OAuth
                            firstName: (profile as any).given_name || "Utilisateur",
                            lastName: (profile as any).family_name || "Google",
                            image: (profile as any).picture,
                            role: "CLIENT",
                        },
                    });
                }
            }
            return true;
        },
    },
    events: {
        async signIn({ user }) {
            console.log(`User signed in: ${user.email}`);
        },
        async signOut() {
            console.log("User signed out");
        },
    },
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
