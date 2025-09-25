"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

const Footer = () => {
  return (
    <footer className="w-full px-4 pb-10 bg-cover bg-center text-foreground">
      <div
        className="max-w-7xl mx-auto rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-md p-6 md:p-10 transition"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
          <section aria-labelledby="social-media">
            <h3 id="social-media" className="text-xl font-semibold mb-4">Our Social Media</h3>
            <nav className="flex space-x-4">
              <Link href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
                <Linkedin className="w-6 h-6" />
              </Link>
            </nav>
          </section>

          <address className="not-italic text-sm space-y-3">
            <h3 className="text-xl font-semibold mb-4">Contact & Location</h3>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 mt-0.5" />
              <span>
                Jl. Ahmad Yani, Tlk. Tering, Kec. Batam Kota,<br />
                Kota Batam, Kepulauan Riau 29461
              </span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3" />
              <a href="mailto:survaanalytics@gmail.com" className="hover:underline">survaanalytics@gmail.com</a>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-3" />
              <a href="tel:+6281234567890" className="hover:underline">+62 812-3456-7890</a>
            </div>
          </address>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-border gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/surva.png"
              alt="SURVA Logo Light"
              width={120}
              height={40}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/images/surva-white.png"
              alt="SURVA Logo Dark"
              width={120}
              height={40}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </Link>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link href="#" className="hover:underline transition">Help Desk</Link>
            <Link href="#" className="hover:underline transition">Customer Support</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
