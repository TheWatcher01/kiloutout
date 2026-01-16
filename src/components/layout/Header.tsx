"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
    Home,
    Briefcase,
    Calendar,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

export function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = session?.user?.role === "ADMIN";
    const isAuthenticated = status === "authenticated";

    const publicLinks = [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/services", label: "Services", icon: Briefcase },
    ];

    const clientLinks = [
        { href: "/dashboard", label: "Mes réservations", icon: Calendar },
        { href: "/profil", label: "Mon profil", icon: User },
    ];

    const adminLinks = [
        { href: "/admin", label: "Réservations", icon: LayoutDashboard },
        { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ];

    const navLinks = isAdmin
        ? [...publicLinks, ...adminLinks]
        : isAuthenticated
            ? [...publicLinks, ...clientLinks]
            : publicLinks;

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">K</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 hidden sm:block">
                            Kiloutout
                        </span>
                    </Link>

                    {/* Navigation Desktop */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <Link
                                    href="/notifications"
                                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                                </Link>

                                {/* Profil dropdown */}
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {session.user.firstName} {session.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {isAdmin ? "Administrateur" : "Client"}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        title="Se déconnecter"
                                    >
                                        <LogOut className="w-5 h-5 text-gray-600" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost">Connexion</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button>Inscription</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}

                        <div className="pt-4 border-t border-gray-200 space-y-2">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Se déconnecter
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full"
                                    >
                                        <Button variant="outline" className="w-full">
                                            Connexion
                                        </Button>
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block w-full"
                                    >
                                        <Button className="w-full">Inscription</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
