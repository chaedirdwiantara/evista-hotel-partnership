"use client";

import { Phone, Mail, MapPin } from "lucide-react";

/**
 * Footer Component
 * 
 * Displays footer information including contact details and legal links.
 * 
 * @param {Object} hotelData - Hotel configuration containing branding and contact info
 */
export default function Footer({ hotelData }) {
  const { theme, name, branding } = hotelData;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="section-container py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Hotel Information */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4" style={{ color: theme.accent }}>
              {name}
            </h3>
            <div className="space-y-3 text-sm">
              {branding.address && (
                <ContactItem icon={MapPin} text={branding.address} />
              )}
              {branding.contactPhone && (
                <ContactItem icon={Phone} text={branding.contactPhone} />
              )}
            </div>
          </div>

          {/* Evista Information */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4" style={{ color: theme.accent }}>
              Evista
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Premium electric vehicle services for discerning travelers. 
              Experience luxury that's kind to our planet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4" style={{ color: theme.accent }}>
              Quick Links
            </h3>
            <nav className="space-y-2 text-sm">
              <FooterLink href="#" text="Privacy Policy" />
              <FooterLink href="#" text="Terms of Service" />
              <FooterLink href="#" text="Contact Support" />
              <FooterLink href="#" text="About Evista" />
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-neutral-800 text-center text-sm">
          <p>
            © {currentYear} Evista. All rights reserved. | Powered by sustainable luxury.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Contact Item Component
 */
function ContactItem({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Footer Link Component
 */
function FooterLink({ href, text }) {
  return (
    <a
      href={href}
      className="block hover:text-white transition-colors duration-200"
    >
      {text}
    </a>
  );
}
