import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createRestaurantMarketingRequest, getRestaurantMarketingRequests } from '@/features/restaurants/services';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { MarketingCampaignRequest } from '@/types';

const emptyForm = { campaign_title: '', objective: '', budget: '', start_date: '', end_date: '', message: '' };

const statusStyles: Record<string, string> = {
  pending: 'bg-[#2a1f00] text-[#ffcf1c]',
  approved: 'bg-[#052814] text-emerald-400',
  rejected: 'bg-[#2a0808] text-red-400',
};

export default function RestaurantMarketingRequestsPage() {
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [requests, setRequests] = React.useState<MarketingCampaignRequest[]>([]);
  const [form, setForm] = React.useState(emptyForm);

  const loadRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      setRequests(await getRestaurantMarketingRequests());
    } catch (error) {
      await showErrorAlert(error, 'Unable to load marketing requests');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createRestaurantMarketingRequest(form);
      await showSuccessAlert(result.msg || 'Marketing request submitted successfully.');
      setForm(emptyForm);
      await loadRequests();
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-[3px] bg-black rounded-full" />
            <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
              Restaurant Backend
            </span>
          </div>
          <h1
            className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-2"
            style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.8rem, 5vw, 3.2rem)' }}
          >
            Marketing<br />Campaign Requests
          </h1>
          <p className="text-[#5a4a00] font-semibold text-sm max-w-md leading-relaxed">
            Submit campaign plans for admin review.
          </p>
        </div>
      </section>

      <div className="h-[5px] bg-black" />

      {/* ── Form + table ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Form card */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Georgia', serif" }}>
                New Campaign
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DarkField label="Campaign Title">
                      <input value={form.campaign_title} onChange={set('campaign_title')} placeholder="e.g. Ramadan Special" className={darkInput} required />
                    </DarkField>
                    <DarkField label="Budget (RM)">
                      <input value={form.budget} onChange={set('budget')} placeholder="500" className={darkInput} />
                    </DarkField>
                    <DarkField label="Start Date">
                      <input type="date" value={form.start_date} onChange={set('start_date')} className={darkInput} />
                    </DarkField>
                    <DarkField label="End Date">
                      <input type="date" value={form.end_date} onChange={set('end_date')} className={darkInput} />
                    </DarkField>
                  </div>
                  <DarkField label="Objective">
                    <Textarea value={form.objective} onChange={set('objective')} placeholder="Describe your campaign objective..." className={darkTextarea} />
                  </DarkField>
                  <DarkField label="Message">
                    <Textarea value={form.message} onChange={set('message')} placeholder="Additional message for the admin..." className={darkTextarea} />
                  </DarkField>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-[#ffcf1c] text-black rounded-xl text-xs font-black uppercase tracking-wide border-none transition-all active:scale-95"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Campaign →'}
                  </Button>
                </div>

                {/* Live preview */}
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
                  <p className="text-[9px] font-black text-[#ffcf1c] uppercase tracking-[0.18em]">Live Preview</p>
                  <h3
                    className="font-black text-white uppercase tracking-tight leading-tight"
                    style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)' }}
                  >
                    {form.campaign_title || 'Campaign Title'}
                  </h3>
                  <p className="text-neutral-500 text-xs leading-relaxed">
                    {form.objective || 'The campaign objective will appear here.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
                      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.1em] mb-1">Budget</p>
                      <p className="text-sm font-black text-[#ffcf1c]">
                        {form.budget ? formatCurrency(form.budget) : '—'}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
                      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.1em] mb-1">Schedule</p>
                      <p className="text-xs font-bold text-white">
                        {form.start_date ? `${formatDate(form.start_date)} → ${formatDate(form.end_date)}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Requests table */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
              <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
              <h2 className="text-xs font-black text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Georgia', serif" }}>
                Submitted Requests
              </h2>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[#2a2a2a]">
              {requests.map((req) => (
                <div key={req.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-white">{req.campaign_title}</p>
                      <p className="text-[10px] text-neutral-600 mt-0.5">{req.objective}</p>
                    </div>
                    <Badge className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-none flex-shrink-0 ${statusStyles[req.status] || statusStyles.pending}`}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-[10px] text-neutral-500">
                    <span>{req.budget ? formatCurrency(req.budget) : '—'}</span>
                    <span>·</span>
                    <span>{req.start_date ? `${formatDate(req.start_date)} – ${formatDate(req.end_date)}` : 'Not scheduled'}</span>
                  </div>
                </div>
              ))}
              {!loading && !requests.length && (
                <p className="p-6 text-xs text-neutral-600 font-medium">No requests submitted yet.</p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#111]">
                    {['Campaign', 'Budget', 'Schedule', 'Status', 'Submitted'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-t border-[#2a2a2a] hover:bg-[#111] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-white">{req.campaign_title}</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">{req.objective}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-400 font-medium">
                        {req.budget ? formatCurrency(req.budget) : '—'}
                      </td>
                      <td className="px-5 py-4 text-[10px] text-neutral-500 font-medium">
                        {req.start_date ? `${formatDate(req.start_date)} → ${formatDate(req.end_date)}` : 'Not scheduled'}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border-none ${statusStyles[req.status] || statusStyles.pending}`}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-[10px] text-neutral-600 font-medium">
                        {formatDateTime(req.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && !requests.length && (
                <p className="px-5 py-6 text-xs text-neutral-600 font-medium">No marketing requests submitted yet.</p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

// Shared dark field wrapper
function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em]">{label}</label>
      {children}
    </div>
  );
}

// Shared class strings
const darkInput =
  'w-full h-11 rounded-xl border-[1.5px] border-[#2a2a2a] bg-[#111] text-white text-xs font-medium px-4 outline-none focus:border-[#ffcf1c] transition-colors placeholder:text-neutral-600 font-[inherit]';

const darkTextarea =
  'w-full min-h-[90px] rounded-xl border-[1.5px] border-[#2a2a2a] bg-[#111] text-white text-xs font-medium p-4 outline-none focus:border-[#ffcf1c] transition-colors placeholder:text-neutral-600 resize-none focus-visible:ring-0';