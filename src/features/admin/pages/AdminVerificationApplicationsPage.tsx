import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchApplications(status: string) {
    const res = await fetch(`${API_BASE_URL}/verification/applications?status=${status}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.msg || 'Failed to fetch applications');
    return data.data;
}

async function acceptStep1(id: string) {
    const res = await fetch(`${API_BASE_URL}/verification/accept-step1/${id}`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.msg || 'Failed to accept');
    return data;
}

async function approveRestaurant(id: string) {
    const res = await fetch(`${API_BASE_URL}/verification/approve/${id}`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.msg || 'Failed to approve');
    return data;
}

const statusLabels = {
    pending: 'Pending',
    step2: 'Step 2',
    approved: 'Approved',
};

export default function AdminVerificationApplicationsPage() {
    const [status, setStatus] = React.useState<'pending' | 'step2' | 'approved'>('pending');
    const [apps, setApps] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setApps(await fetchApplications(status));
            } catch (e) {
                await showErrorAlert(e, 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        })();
    }, [status]);

    const handleAccept = async (id: string) => {
        setActionLoading(id);
        try {
            await acceptStep1(id);
            await showSuccessAlert('Moved to step 2!');
            setApps(await fetchApplications(status));
        } catch (e) {
            await showErrorAlert(e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await approveRestaurant(id);
            await showSuccessAlert('Restaurant approved!');
            setApps(await fetchApplications(status));
        } catch (e) {
            await showErrorAlert(e);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12">
            <Card className="rounded-[32px] border-none shadow-sm bg-white">
                <CardContent className="p-8">
                    <h1 className="text-3xl font-black mb-6">Verification Applications</h1>
                    <div className="flex gap-4 mb-6">
                        {(['pending', 'step2', 'approved'] as const).map((s) => (
                            <Button key={s} variant={status === s ? 'default' : 'outline'} onClick={() => setStatus(s)}>{statusLabels[s]}</Button>
                        ))}
                    </div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : !apps.length ? (
                        <div>No applications found.</div>
                    ) : (
                        <div className="space-y-6">
                            {apps.map((app) => (
                                <div key={app.id} className="border rounded-xl p-4 flex flex-col gap-2">
                                    <div className="font-bold text-lg">{app.name}</div>
                                    <div className="text-sm text-neutral-500">Owner: {app.verificationData?.ownerName || 'N/A'}</div>
                                    <div className="text-sm text-neutral-500">Phone: {app.verificationData?.ownerPhone || 'N/A'}</div>
                                    <div className="text-sm text-neutral-500">Email: {app.verificationData?.ownerEmail || 'N/A'}</div>
                                    <div className="text-sm text-neutral-500">Location: {app.verificationData?.location || 'N/A'}</div>
                                    <div className="flex gap-2 mt-2">
                                        {status === 'pending' && (
                                            <Button disabled={actionLoading === app.id} onClick={() => handleAccept(app.id)} className="bg-[#6EA15C] text-white font-bold">Accept Step 1</Button>
                                        )}
                                        {status === 'step2' && (
                                            <Button disabled={actionLoading === app.id} onClick={() => handleApprove(app.id)} className="bg-[#6EA15C] text-white font-bold">Approve</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
