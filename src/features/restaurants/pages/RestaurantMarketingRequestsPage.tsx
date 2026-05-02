import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createRestaurantMarketingRequest, getRestaurantMarketingRequests } from '@/features/restaurants/services';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { MarketingCampaignRequest } from '@/types';

const emptyForm = {
  campaign_title: '',
  objective: '',
  budget: '',
  start_date: '',
  end_date: '',
  message: '',
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

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Backend</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Marketing Campaign Requests</h1>
        <p className="text-neutral-500 font-medium">Submit campaign plans for admin review using the backend marketing request route.</p>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <FormInput label="Campaign Title" value={form.campaign_title} onChange={(value) => setForm((current) => ({ ...current, campaign_title: value }))} />
              <div className="space-y-2">
                <Label>Objective</Label>
                <Textarea placeholder="Objective" value={form.objective} onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))} className="min-h-28" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Budget" value={form.budget} onChange={(value) => setForm((current) => ({ ...current, budget: value }))} />
                <FormInput label="Start Date" type="date" value={form.start_date} onChange={(value) => setForm((current) => ({ ...current, start_date: value }))} />
                <FormInput label="End Date" type="date" value={form.end_date} onChange={(value) => setForm((current) => ({ ...current, end_date: value }))} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className="min-h-32" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide">
                {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Preview</p>
              <div className="rounded-[32px] border border-neutral-100 bg-[#f7f7f2] p-6 space-y-4">
                <h2 className="text-3xl font-black tracking-tight text-neutral-900">{form.campaign_title || 'Campaign title'}</h2>
                <p className="text-neutral-500 font-medium">{form.objective || 'The campaign objective will appear here.'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-medium text-neutral-600">
                  <div className="rounded-2xl bg-white p-4">Budget: {form.budget ? formatCurrency(form.budget) : 'Not set'}</div>
                  <div className="rounded-2xl bg-white p-4">
                    Schedule: {form.start_date ? `${formatDate(form.start_date)} - ${formatDate(form.end_date)}` : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-black text-neutral-900">{request.campaign_title}</p>
                      <p className="text-sm text-neutral-500">{request.objective}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.budget ? formatCurrency(request.budget) : 'Not set'}</TableCell>
                  <TableCell>{request.start_date ? `${formatDate(request.start_date)} - ${formatDate(request.end_date)}` : 'Not scheduled'}</TableCell>
                  <TableCell>
                    <Badge className={request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-none' : request.status === 'approved' ? 'bg-green-100 text-green-700 border-none' : 'bg-red-100 text-red-700 border-none'}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && !requests.length && (
            <p className="pt-6 text-sm text-neutral-500">No marketing requests submitted yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Input placeholder={label} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
