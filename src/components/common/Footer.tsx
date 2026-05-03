import * as React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Twitter, Facebook, Instagram, Youtube, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// import primaryLogo from '@/assets/images/primarylogo.jpeg';

const QUICK_LINKS = ["Become a Rider", "Add your restaurant", "My account", "Help and Faq", "Blog", "Contact"];
const FOOTER_CATS = ["Shawarma", "Grills & BBQ", "Falafel & Wraps", "Mezze", "Desserts"];

export default function Footer() {
  const [email, setEmail] = React.useState("");

  return (
    <footer style={{ background: '#070605', color: '#fff' }} className="pt-20">
      <div className="container px-4 mx-auto">

        {/* Brand strip */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* Logo image (uncomment when available in assets):
            <img src={primaryLogo} alt="Yalla Habibi" className="h-14 w-auto object-contain" /> */}

            {/* Text logo */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
              style={{ background: '#ffcf1c', color: '#070605' }}
            >
              يل
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight" style={{ color: '#ffcf1c' }}>
                YallaHabibi
                <span className="text-base" style={{ color: 'rgba(255,207,28,0.5)' }}>.my</span>
              </span>
              <span className="text-xs font-medium tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Where Great Things Meets Habibi Taste
              </span>
            </div>
          </div>

          {/* Tagline accent bar */}
          <div
            className="h-1 w-24 rounded-full hidden md:block"
            style={{ background: '#ffcf1c' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Quick Links */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: '#ffcf1c' }}
            >
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l}
                  to="#"
                  className="text-sm font-medium transition-colors duration-150 flex items-center gap-2 group"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffcf1c'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}
                >
                  <span
                    className="w-1 h-1 rounded-full flex-shrink-0 group-hover:w-3 transition-all duration-200"
                    style={{ background: '#ffcf1c' }}
                  />
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: '#ffcf1c' }}
            >
              Categories
            </h4>
            <div className="flex flex-col gap-3">
              {FOOTER_CATS.map((c) => (
                <Link
                  key={c}
                  to="#"
                  className="text-sm font-medium transition-colors duration-150 flex items-center gap-2 group"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#ffcf1c'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}
                >
                  <span
                    className="w-1 h-1 rounded-full flex-shrink-0 group-hover:w-3 transition-all duration-200"
                    style={{ background: '#ffcf1c' }}
                  />
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-6">
            <h4
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: '#ffcf1c' }}
            >
              Contacts
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#ffcf1c' }} />
                <span className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  12 Jalan Bukit Bintang<br />Kuala Lumpur - MY
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <Phone className="w-5 h-5 shrink-0" style={{ color: '#ffcf1c' }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>+60 12-345-6789</span>
              </div>
              <div className="flex gap-4 items-center">
                <Mail className="w-5 h-5 shrink-0" style={{ color: '#ffcf1c' }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>info@yallahabibi.my</span>
              </div>
            </div>
          </div>

          {/* Keep in Touch */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: '#ffcf1c' }}
              >
                Keep In Touch
              </h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-l-xl rounded-r-none h-12 text-white border-none focus-visible:ring-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
                <Button
                  className="rounded-l-none rounded-r-xl h-12 px-4 font-bold transition-all"
                  style={{ background: '#ffcf1c', color: '#070605' }}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: '#ffcf1c' }}
              >
                Follow Us
              </h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#ffcf1c'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          className="py-8 flex flex-col md:flex-row justify-between items-center gap-6"
          style={{ borderTop: '1px solid rgba(255,207,28,0.15)' }}
        >
          <div className="flex items-center gap-6">
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                border: '1px solid rgba(255,207,28,0.3)',
                color: 'rgba(255,255,255,0.5)',
                background: 'transparent',
              }}
            >
              <Globe className="w-4 h-4" /> English
            </button>
            <div className="flex gap-2">
              {['VISA', 'MC', 'PP', 'AMEX'].map((p) => (
                <div
                  key={p}
                  className="rounded px-2 py-1 text-[10px] font-black"
                  style={{
                    background: 'rgba(255,207,28,0.1)',
                    color: '#ffcf1c',
                    border: '1px solid rgba(255,207,28,0.2)',
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link to="#" className="hover:text-white transition-colors">Terms and conditions</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <span style={{ color: '#ffcf1c' }}>© Yalla Habibi .my</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
