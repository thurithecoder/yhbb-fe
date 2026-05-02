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
//           <Badge className="bg-green-50 text-[#6EA15C] border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-4">
//             Support Intake
//           </Badge>
//           <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#6EA15C]">
//             WE ARE ALL EARS, HABIBI
//           </h1>
//         </motion.div>
//       </section>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         <div className="space-y-6">
//           <Card className="border-none shadow-xl rounded-[40px] bg-neutral-900 text-white p-8 overflow-hidden relative">
//             <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6EA15C]/20 rounded-full blur-2xl" />
//             <CardContent className="p-0 space-y-12 relative z-10">
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-black tracking-tighter uppercase text-[#6EA15C]">CONTACT INFO</h3>
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
//                   className="w-full h-14 rounded-2xl border-2 border-neutral-100 bg-white px-6 text-lg font-medium outline-none focus:border-[#6EA15C]"
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
//                   className="min-h-[200px] p-6 rounded-3xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#6EA15C] resize-none"
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full h-16 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
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
//       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#6EA15C] transition-colors">
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
//         className="h-14 px-6 rounded-2xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#6EA15C]"
//       />
//     </div>
//   );
// }
import * as React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      // استدعاء الـ backend API الجديد
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await showSuccessAlert(result.msg || 'Message sent successfully! We will get back to you soon.');
        setForm(emptyForm);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      await showErrorAlert(error, 'Unable to send support request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-green-50 text-[#6EA15C] border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-4">
            Support Intake
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-[#6EA15C]">
            WE ARE ALL EARS, HABIBI
          </h1>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[40px] bg-neutral-900 text-white p-8 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6EA15C]/20 rounded-full blur-2xl" />
            <CardContent className="p-0 space-y-12 relative z-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase text-[#6EA15C]">CONTACT INFO</h3>
                <p className="text-neutral-400 text-sm font-medium">Reach out to us through any of these channels.</p>
              </div>

              <div className="space-y-8">
                <ContactRow icon={Mail} label="Email Us" value="support@yallahabibi.app" />
                <ContactRow icon={Phone} label="Call Us" value="+60 10 000 0000" />
                <ContactRow icon={MapPin} label="Visit Us" value="Kuala Lumpur, Malaysia" />
              </div>

              <div className="pt-8 border-t border-white/10 flex gap-4">
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm rounded-[40px] bg-white p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput
                  label="Full Name"
                  value={form.fullName}
                  onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
                  required
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Inquiry Type</label>
                <select
                  value={form.inquiryType}
                  onChange={(event) => setForm((current) => ({ ...current, inquiryType: event.target.value }))}
                  className="w-full h-14 rounded-2xl border-2 border-neutral-100 bg-white px-6 text-lg font-medium outline-none focus:border-[#6EA15C]"
                  required
                >
                  <option value="General Support">General Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Restaurant Onboarding">Restaurant Onboarding</option>
                  <option value="Admin Assistance">Admin Assistance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Message</label>
                <Textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="How can we help you?"
                  className="min-h-[200px] p-6 rounded-3xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#6EA15C] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <Send className="w-6 h-6" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#6EA15C] transition-colors">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Input
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        className="h-14 px-6 rounded-2xl bg-white border-2 border-neutral-100 text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#6EA15C]"
      />
    </div>
  );
}