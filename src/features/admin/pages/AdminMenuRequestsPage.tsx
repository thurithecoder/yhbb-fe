import * as React from 'react';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMenuChangeRequests, verifyMenuChangeRequest } from '@/features/admin/services';
import { formatCurrency, formatDateTime } from '@/utils';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { MenuChangeRequest } from '@/types';
import { ChevronDown, ChevronUp, Info, Plus, PenSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminMenuRequestsPage() {
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [requests, setRequests] = React.useState<MenuChangeRequest[]>([]);
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const loadRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMenuChangeRequests(status || undefined);

      const validRequests = data.filter(request => {
        if (request.status === 'pending' && !request.menu_item_details) {
          return false;
        }
        if (request.status === 'pending' && request.menu_item_details && !request.menu_item_details.name_en) {
          return false;
        }
        return true;
      });

      setRequests(validRequests);
    } catch (error) {
      await showErrorAlert(error, 'Unable to load menu requests');
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleReview = async (request: MenuChangeRequest, nextStatus: 'approved' | 'rejected') => {
    if (!request.menu_item_details || !request.menu_item_details.id) {
      await showErrorAlert(null, 'This menu item has been deleted and cannot be reviewed.');
      await loadRequests();
      return;
    }

    const isRejection = nextStatus === 'rejected';
    const result = await Swal.fire({
      title: `${isRejection ? 'Reject' : 'Approve'} request?`,
      text: `Restaurant: ${request.tblrestaurant?.name || 'Unknown restaurant'}`,
      input: 'textarea',
      inputLabel: isRejection ? 'Rejection reason' : 'Review note',
      inputPlaceholder: isRejection
        ? 'Tell the restaurant why this item was rejected...'
        : 'Optional note for the restaurant...',
      inputAttributes: {
        maxlength: '300',
      },
      inputValidator: (value) => {
        if (isRejection && !String(value || '').trim()) {
          return 'Rejection reason is required.';
        }
        return undefined;
      },
      showCancelButton: true,
      confirmButtonText: isRejection ? 'Reject' : 'Approve',
      confirmButtonColor: '#6EA15C',
      cancelButtonColor: '#111827',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await verifyMenuChangeRequest({
        request_id: request.id,
        status: nextStatus,
        review_note: String(result.value || '').trim() || undefined,
      });
      await showSuccessAlert(response.msg || 'Request updated successfully.');
      await loadRequests();
      setExpandedRowId(null);
    } catch (error) {
      await showErrorAlert(error);
    }
  };

  const isItemDeleted = (request: MenuChangeRequest): boolean => {
    return !request.menu_item_details || !request.menu_item_details.name_en;
  };

  const getRequestType = (request: MenuChangeRequest): 'create' | 'update' => {
    if (!request.menu_item_details) return 'create';
    if (!request.menu_item_details.name_en && request.requested_name_en) return 'create';
    return 'update';
  };

  const toggleExpand = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Admin Workflow</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Menu Change Requests</h1>
          <p className="text-neutral-500 font-medium">Review restaurant menu submissions directly against the backend approval route.</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-600 outline-none focus:border-[#6EA15C]"
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
                <TableHead className="w-10"></TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Item Details</TableHead>
                <TableHead>Requested Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const itemDeleted = isItemDeleted(request);
                const requestType = getRequestType(request);
                const isExpanded = expandedRowId === request.id;
                const originalItem = request.menu_item_details;

                return (
                  <React.Fragment key={request.id}>
                    <TableRow className={itemDeleted ? 'opacity-50 bg-neutral-50' : ''}>
                      <TableCell className="align-top">
                        <button
                          onClick={() => toggleExpand(request.id)}
                          className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                          disabled={itemDeleted}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="align-top">{request.tblrestaurant?.name || 'Unknown restaurant'}</TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-3">
                          {originalItem?.image_base64 && !itemDeleted && (
                            <img
                              src={originalItem.image_base64}
                              alt={request.requested_name_en || originalItem.name_en || 'Menu item'}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          )}
                          {itemDeleted && (
                            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                              <span className="text-red-500 text-xs font-bold">DELETED</span>
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-neutral-900">
                                {itemDeleted
                                  ? (request.requested_name_en || 'Item Deleted')
                                  : (request.requested_name_en || originalItem?.name_en || request.item_id)
                                }
                              </p>
                              {!itemDeleted && (
                                <Badge className={requestType === 'create' ? 'bg-blue-100 text-blue-700 border-none text-[10px]' : 'bg-purple-100 text-purple-700 border-none text-[10px]'}>
                                  {requestType === 'create' ? (
                                    <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> New</span>
                                  ) : (
                                    <span className="flex items-center gap-1"><PenSquare className="w-3 h-3" /> Update</span>
                                  )}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              {itemDeleted
                                ? 'Item no longer exists in database'
                                : (originalItem?.tblcategory?.name_en || request.item_type)
                              }
                            </p>
                            {!itemDeleted && (
                              <p className="text-xs text-neutral-500 line-clamp-2">
                                {originalItem?.description_en
                                  || originalItem?.description_ms
                                  || originalItem?.description_ar
                                  || 'No description'}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className="font-bold text-[#6EA15C]">{formatCurrency(request.requested_price)}</span>
                        {requestType === 'update' && originalItem?.price !== request.requested_price && (
                          <p className="text-xs text-neutral-400 line-through">
                            was {formatCurrency(originalItem?.price || 0)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <Badge className={
                            request.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 border-none'
                              : request.status === 'approved'
                                ? 'bg-green-100 text-green-700 border-none'
                                : 'bg-red-100 text-red-700 border-none'
                          }>
                            {itemDeleted && request.status === 'pending' ? 'item_deleted' : request.status}
                          </Badge>
                          {request.status === 'rejected' && request.review_note && (
                            <p className="text-xs text-red-600">{request.review_note}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">{formatDateTime(request.createdAt)}</TableCell>
                      <TableCell className="text-right align-top">
                        {request.status === 'pending' && !itemDeleted ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleReview(request, 'approved')}
                              className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide text-xs h-9 px-4"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReview(request, 'rejected')}
                              variant="outline"
                              className="rounded-xl font-black uppercase tracking-wide text-red-600 border-red-200 hover:bg-red-50 text-xs h-9 px-4"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (request.status === 'pending' && itemDeleted) ? (
                          <span className="text-xs font-medium text-red-500">Cannot review - item deleted</span>
                        ) : (
                          <span className="text-xs font-medium text-neutral-400">Reviewed</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details Row */}
                    <AnimatePresence>
                      {isExpanded && !itemDeleted && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0 bg-neutral-50">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 space-y-4 border-t border-neutral-100">
                                {/* Request Type Info */}
                                <div className="bg-white rounded-xl p-4">
                                  <h4 className="font-black text-neutral-900 mb-3 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-[#6EA15C]" />
                                    Request Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-neutral-500">Request Type</p>
                                      <p className="font-medium flex items-center gap-2">
                                        {requestType === 'create' ? (
                                          <><Plus className="w-4 h-4 text-blue-500" /> New Menu Item Creation</>
                                        ) : (
                                          <><PenSquare className="w-4 h-4 text-purple-500" /> Existing Menu Item Update</>
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-neutral-500">Request ID</p>
                                      <p className="font-mono text-sm">{request.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-neutral-500">Submitted By</p>
                                      <p>{request.tblrestaurant?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-neutral-500">Submitted At</p>
                                      <p>{formatDateTime(request.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Current vs Requested Details */}
                                <div className="bg-white rounded-xl p-4">
                                  <h4 className="font-black text-neutral-900 mb-3">Requested Changes</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                      <p className="text-xs font-bold text-neutral-500 mb-2">Item Name</p>
                                      <div className="space-y-2">
                                        {requestType === 'update' && originalItem && (
                                          <div>
                                            <p className="text-xs text-neutral-400">Current</p>
                                            <p className="text-sm">{originalItem.name_en || '—'}</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-xs text-amber-600">Requested</p>
                                          <p className="text-sm font-medium text-amber-700">{request.requested_name_en || '—'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Price */}
                                    <div>
                                      <p className="text-xs font-bold text-neutral-500 mb-2">Price</p>
                                      <div className="space-y-2">
                                        {requestType === 'update' && originalItem && (
                                          <div>
                                            <p className="text-xs text-neutral-400">Current</p>
                                            <p className="text-sm">{formatCurrency(originalItem.price || 0)}</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-xs text-amber-600">Requested</p>
                                          <p className="text-sm font-medium text-amber-700">{formatCurrency(request.requested_price)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Current Item Details */}
                                {originalItem && (
                                  <div className="bg-white rounded-xl p-4">
                                    <h4 className="font-black text-neutral-900 mb-3">Current Item Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* English */}
                                      <div>
                                        <p className="text-xs text-neutral-500">Name (EN)</p>
                                        <p className="font-medium">{originalItem.name_en || '—'}</p>
                                      </div>

                                      {/* Arabic - Centered */}
                                      <div className="flex flex-col items-center">
                                        <p className="text-xs text-neutral-500 text-center">Name (AR)</p>
                                        <p className="font-medium text-center" dir="rtl">{originalItem.name_ar || '—'}</p>
                                      </div>

                                      {/* Malay */}
                                      <div>
                                        <p className="text-xs text-neutral-500">Name (MS)</p>
                                        <p className="font-medium">{originalItem.name_ms || '—'}</p>
                                      </div>

                                      {/* Description - Full Width */}
                                      <div className="col-span-3">
                                        <p className="text-xs text-neutral-500">Description</p>
                                        <p className="text-sm">
                                          {originalItem.description_en || originalItem.description_ms || originalItem.description_ar || 'No description'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Category */}
                                <div className="bg-white rounded-xl p-4">
                                  <h4 className="font-black text-neutral-900 mb-3">Category</h4>
                                  <p className="text-sm">
                                    {originalItem?.tblcategory?.name_en || request.item_type || '—'}
                                  </p>
                                </div>

                                {/* Tags */}
                                {originalItem?.taqs && originalItem.taqs.length > 0 && (
                                  <div className="bg-white rounded-xl p-4">
                                    <h4 className="font-black text-neutral-900 mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {originalItem.taqs.map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-[#6EA15C] border border-green-100"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          {!loading && !requests.length && (
            <p className="pt-6 text-sm text-neutral-500 text-center">No menu change requests match the selected filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}