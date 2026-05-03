// import * as React from 'react';
// import { motion } from 'motion/react';
// import { Mail, Phone, MapPin, Send, MessageCircle, Globe } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { submitSupportIntake } from '@/features/auth/services';
// import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

// const emptyForm = {
//   fullName: '',
//   email: '',
//   inquiryType: 'General Support',
//   message: '',
// };

// export default function ContactPage() {
//   const [form, setForm] = React.useState(emptyForm);
//   const [isSubmitting, setIsSubmitting] = React.useState(false);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const result = await submitSupportIntake(form);
//       await showSuccessAlert(result.msg || 'Message sent successfully.');
//       setForm(emptyForm);
//     } catch (error) {
//       await showErrorAlert(error, 'Unable to send support request');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-16">
//       <section className="text-center space-y-6 max-w-3xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <Badge className="bg-[#FFF9DC] text-[#ffcf1c] border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-4">
//             Support Intake
//           </Badge>
//           <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#ffcf1c]">
//             WE ARE ALL EARS, HABIBI
//           </h1>
//         </motion.div>
//       </section>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         <div className="space-y-6">
//           <Card className="border-none shadow-xl rounded-[40px] bg-neutral-900 text-white p-8 overflow-hidden relative">
//             <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ffcf1c]/20 rounded-full blur-2xl" />
//             <CardContent className="p-0 space-y-12 relative z-10">
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-black tracking-tighter uppercase text-[#ffcf1c]">CONTACT INFO</h3>
//                 <p className="text-neutral-400 text-sm font-medium">Reach out to us through any of these channels.</p>
//               </div>

//               <div className="space-y-8">
//                 <ContactRow icon={Mail} label="Email Us" value="support@yallahabibi.app" />
//                 <ContactRow icon={Phone} label="Call Us" value="+60 10 000 0000" />
//                 <ContactRow icon={MapPin} label="Visit Us" value="Kuala Lumpur, Malaysia" />
//               </div>

//               <div className="pt-8 border-t border-white/10 flex gap-4">
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-2">
//           <Card className="border-none shadow-sm rounded-[40px] bg-white p-8 md:p-12">
//             <form onSubmit={handleSubmit} className="space-y-8">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <FormInput label="Full Name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
//                 <FormInput label="Email Address" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
//               </div>

//               <div className="space-y-2">
//                 <select
//                   value={form.inquiryType}
//                   onChange={(event) => setForm((current) => ({ ...current, inquiryType: event.target.value }))}
//                   className="w-full h-14 rounded-2xl border-2 border-neutral-100 bg-white px-6 text-lg font-medium outline-none focus:border-[#ffcf1c]"
//                 >
//                   <option value="" disabled>Inquiry type</option>
//                   <option value="General Support">General Support</option>
//                   <option value="Billing">Billing</option>
//                   <option value="Restaurant Onboarding">Restaurant Onboarding</option>
//                   <option value="Admin Assistance">Admin Assistance</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <Textarea
//                   value={form.message}
//                   onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
//                   placeholder="Message"
//                   className="min-h-[200px] p-6 rounded-3xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#ffcf1c] resize-none"
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full h-16 bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
//               >
//                 <Send className="w-6 h-6" />
//                 {isSubmitting ? 'Sending...' : 'Send Message'}
//               </Button>
//             </form>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ContactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-4 group">
//       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#ffcf1c] transition-colors">
//         <Icon className="w-6 h-6 text-white" />
//       </div>
//       <div>
//         <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">{label}</p>
//         <p className="font-bold text-lg">{value}</p>
//       </div>
//     </div>
//   );
// }

// function FormInput({
//   label,
//   value,
//   onChange,
//   type = 'text',
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   type?: string;
// }) {
//   return (
//     <div>
//       <Input
//         placeholder={label}
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         type={type}
//         className="h-14 px-6 rounded-2xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#ffcf1c]"
//       />
//     </div>
//   );
// }
import * as React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

const emptyForm = {
  fullName: '',
  email: '',
  inquiryType: 'General Support',
  message: '',
};

export default function ContactPage() {
  const [form, setForm] = React.useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        await showSuccessAlert(result.msg || 'Message sent successfully!');
        setForm(emptyForm);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      await showErrorAlert(error, 'Unable to send support request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band — yellow bg like homepage ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-[3px] bg-black rounded-full" />
              <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                Support Intake
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-3"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2.4rem, 8vw, 5.5rem)' }}
            >
              We Are All<br />Ears, Habibi
            </h1>
            <p className="text-[#5a4a00] font-semibold text-sm sm:text-base max-w-md leading-relaxed">
              Got a question, concern, or just want to say hi? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Black stripe divider — matches homepage */}
      <div className="h-[5px] bg-black" />

      {/* ── Main content — dark band ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Contact info card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
                <h3
                  className="text-[#ffcf1c] font-black uppercase tracking-tight text-base sm:text-lg"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Contact Info
                </h3>
              </div>
              <p className="text-neutral-500 text-xs font-medium leading-relaxed">
                Reach us through any of these channels.
              </p>
            </div>

            <div className="space-y-5">
              <ContactRow icon={Mail} label="Email" value="support@yallahabibi.app" />
              <ContactRow icon={Phone} label="Phone" value="+60 10 000 0000" />
              <ContactRow icon={MapPin} label="Location" value="Kuala Lumpur, Malaysia" />
            </div>

            <div className="border-t border-[#2a2a2a] pt-5 flex gap-2">
              {[Twitter, Instagram, MessageCircle].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center cursor-pointer transition-all hover:bg-[#ffcf1c] hover:border-[#ffcf1c] group"
                >
                  <Icon className="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name">
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Your full name"
                    required
                    className="h-12 px-4 rounded-xl bg-[#111] border-[#2a2a2a] border-[1.5px] text-white placeholder:text-neutral-600 text-sm font-medium focus-visible:ring-0 focus-visible:border-[#ffcf1c] transition-colors"
                  />
                </FormField>
                <FormField label="Email Address">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="h-12 px-4 rounded-xl bg-[#111] border-[#2a2a2a] border-[1.5px] text-white placeholder:text-neutral-600 text-sm font-medium focus-visible:ring-0 focus-visible:border-[#ffcf1c] transition-colors"
                  />
                </FormField>
              </div>

              {/* Inquiry type */}
              <FormField label="Inquiry Type">
                <select
                  value={form.inquiryType}
                  onChange={(e) => setForm((f) => ({ ...f, inquiryType: e.target.value }))}
                  required
                  className="w-full h-12 rounded-xl bg-[#111] border-[1.5px] border-[#2a2a2a] text-white px-4 text-sm font-medium outline-none focus:border-[#ffcf1c] transition-colors appearance-none cursor-pointer"
                >
                  <option value="General Support">General Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Restaurant Onboarding">Restaurant Onboarding</option>
                  <option value="Admin Assistance">Admin Assistance</option>
                </select>
              </FormField>

              {/* Message */}
              <FormField label="Message">
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help you?"
                  required
                  className="min-h-[120px] sm:min-h-[150px] p-4 rounded-xl bg-[#111] border-[1.5px] border-[#2a2a2a] text-white placeholder:text-neutral-600 text-sm font-medium focus-visible:ring-0 focus-visible:border-[#ffcf1c] transition-colors resize-none"
                />
              </FormField>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 sm:h-14 bg-[#ffcf1c] hover:opacity-90 text-black rounded-xl font-black uppercase tracking-wide text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-none"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>

        </div>
      </section>

    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#ffcf1c] group-hover:border-[#ffcf1c]">
        <Icon className="w-4 h-4 text-[#ffcf1c] group-hover:text-black transition-colors" />
      </div>
      <div>
        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em]">{label}</p>
        <p className="text-white text-xs sm:text-sm font-bold leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.12em]">
        {label}
      </label>
      {children}
    </div>
  );
}