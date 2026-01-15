import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* À propos */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-white font-bold text-xl">K</span>
                            </div>
                            <span className="font-bold text-xl text-white">Kiloutout</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Votre partenaire de confiance pour tous vos services à domicile.
                            Qualité, fiabilité et proximité au cœur de notre engagement.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Nos Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/services/conciergerie"
                                    className="hover:text-white transition-colors"
                                >
                                    Conciergerie
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services/menage"
                                    className="hover:text-white transition-colors"
                                >
                                    Femme de ménage
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services/aide-personne"
                                    className="hover:text-white transition-colors"
                                >
                                    Aide à la personne
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services/repassage"
                                    className="hover:text-white transition-colors"
                                >
                                    Repassage
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services/gardiennage-animaux"
                                    className="hover:text-white transition-colors"
                                >
                                    Gardiennage d&apos;animaux
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services/tonte-pelouse"
                                    className="hover:text-white transition-colors"
                                >
                                    Tonte de pelouse
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Liens utiles */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Liens utiles</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-white transition-colors"
                                >
                                    Tous nos services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tarifs"
                                    className="hover:text-white transition-colors"
                                >
                                    Nos tarifs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-white transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/mentions-legales"
                                    className="hover:text-white transition-colors"
                                >
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/confidentialite"
                                    className="hover:text-white transition-colors"
                                >
                                    Politique de confidentialité
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>
                                    1803 route de Toulouse
                                    <br />
                                    82700 Escatalens
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                                <a
                                    href="tel:+33600000000"
                                    className="hover:text-white transition-colors"
                                >
                                    06 00 00 00 00
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                                <a
                                    href="mailto:contact@kiloutout.fr"
                                    className="hover:text-white transition-colors"
                                >
                                    contact@kiloutout.fr
                                </a>
                            </li>
                        </ul>

                        {/* Réseaux sociaux */}
                        <div className="flex gap-4 mt-6">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-800 hover:bg-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-800 hover:bg-primary transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
                    <p>
                        © {new Date().getFullYear()} Kiloutout Services. Tous droits
                        réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
