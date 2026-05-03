import * as React from 'react';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMarketingCampaignRequests, verifyMarketingCampaignRequest } from '@/features/admin/services';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { MarketingCampaignRequest } from '@/types';

export default function AdminCampaignRequestsPage() {
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [requests, setRequests] = React.useState<MarketingCampaignRequest[]>([]);

  const loadRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      setRequests(await getMarketingCampaignRequests(status || undefined));
    } catch (error) {
      await showErrorAlert(error, 'Unable to load campaign requests');
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleReview = async (request: MarketingCampaignRequest, nextStatus: 'approved' | 'rejected') => {
    const result = await Swal.fire({
      title: `${nextStatus === 'approved' ? 'Approve' : 'Reject'} campaign?`,
      text: `Campaign: ${request.campaign_title}`,
      input: 'textarea',
      inputLabel: 'Review note',
      inputPlaceholder: 'Optional note for the restaurant...',
      inputAttributes: {
        maxlength: '300',
      },
      showCancelButton: true,
      confirmButtonText: nextStatus === 'approved' ? 'Approve' : 'Reject',
      confirmButtonColor: '#ffcf1c',
      cancelButtonColor: '#111827',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await verifyMarketingCampaignRequest({
        request_id: request.id,
        status: nextStatus,
        review_note: result.value || undefined,
      });
      await showSuccessAlert(response.msg || 'Request updated successfully.');
      await loadRequests();
    } catch (error) {
      await showErrorAlert(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Admin Workflow</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Campaign Requests</h1>
          <p className="text-neutral-500 font-medium">Approve or reject restaurant marketing proposals using the backend verification route.</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-600 outline-none focus:border-[#ffcf1c]"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.tblrestaurant?.name || 'Unknown restaurant'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-black text-neutral-900">{request.campaign_title}</p>
                      <p className="text-sm text-neutral-500">{request.objective}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.budget ? formatCurrency(request.budget) : 'Not set'}</TableCell>
                  <TableCell>{request.start_date ? `${formatDate(request.start_date)} - ${formatDate(request.end_date)}` : 'Not scheduled'}</TableCell>
                  <TableCell>
                    <Badge className={request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-none' : request.status === 'approved' ? 'bg-[#FFF9DC] text-[#070605] border-none' : 'bg-red-100 text-red-700 border-none'}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleReview(request, 'approved')} className="bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-xl font-black uppercase tracking-wide">
                          Approve
                        </Button>
                        <Button onClick={() => handleReview(request, 'rejected')} variant="outline" className="rounded-xl font-black uppercase tracking-wide text-red-600 border-red-200 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-neutral-400">Reviewed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && !requests.length && (
            <p className="pt-6 text-sm text-neutral-500">No campaign requests match the selected filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
