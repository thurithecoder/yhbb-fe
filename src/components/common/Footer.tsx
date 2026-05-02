import * as React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Twitter, Facebook, Instagram, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const QUICK_LINKS = ["Become a Rider", "Add your restaurant", "My account", "Help and Faq", "Blog", "Contact"];
const FOOTER_CATS = ["Shawarma", "Grills & BBQ", "Falafel & Wraps", "Mezze", "Desserts"];

export default function Footer() {
  const [email, setEmail] = React.useState("");

  return (
    <footer className="bg-[#141414] text-white pt-20">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {QUICK_LINKS.map((l) => (
                <Link key={l} to="#" className="text-sm text-neutral-500 hover:text-[#6EA15C] transition-colors font-medium">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Categories</h4>
            <div className="flex flex-col gap-3">
              {FOOTER_CATS.map((c) => (
                <Link key={c} to="#" className="text-sm text-neutral-500 hover:text-[#6EA15C] transition-colors font-medium">
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Contacts</h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-[#6EA15C] shrink-0" />
                <span className="text-sm text-neutral-500 font-medium leading-relaxed">
                  12 Jalan Bukit Bintang<br />Kuala Lumpur - MY
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <Phone className="w-5 h-5 text-[#6EA15C] shrink-0" />
                <span className="text-sm text-neutral-500 font-medium">+60 12-345-6789</span>
              </div>
              <div className="flex gap-4 items-center">
                <Mail className="w-5 h-5 text-[#6EA15C] shrink-0" />
                <span className="text-sm text-neutral-500 font-medium">info@yallahabibi.my</span>
              </div>
            </div>
          </div>

          {/* Keep in Touch */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Keep In Touch</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-800 border-none rounded-l-xl h-12 text-white focus-visible:ring-0"
                />
                <Button className="bg-[#6EA15C] hover:bg-[#5D8A4E] rounded-l-none rounded-r-xl h-12 px-4">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Follow Us</h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center hover:bg-[#6EA15C] transition-all group">
                    <Icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-800 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-800 transition-colors">
              <Globe className="w-4 h-4" /> English
            </button>
            <div className="flex gap-2">
              {['VISA', 'MC', 'PP', 'AMEX'].map((p) => (
                <div key={p} className="bg-neutral-800 rounded px-2 py-1 text-[10px] font-black text-neutral-400">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-500 font-medium">
            <Link to="#" className="hover:text-white transition-colors">Terms and conditions</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <span>© Yalla Habibi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { ArrowRight } from 'lucide-react';
