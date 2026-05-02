import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CUISINE_OPTIONS } from '@/constants/cuisines';
import { getRestaurantProfile, updateRestaurantProfile, setRestaurantActiveStatus } from '@/features/restaurants/services';
import { readFileAsDataUrl, parseCuisines } from '@/utils';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import MapPicker from '@/features/map/components/MapPicker';
import { MapPin, ChevronDown, X } from 'lucide-react';

// Add camera icon component
const CameraIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

type RestaurantProfileForm = {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  working_time_from: string;
  working_time_from_period: string;
  working_time_to: string;
  working_time_to_period: string;
  phone: string;
  cuisines: string[];
  profilepic: string;
  verificationStatus?: string;
  verificationStep?: number;
  is_active?: boolean;
};

const timeOptions = buildTimeOptions();

const emptyForm: RestaurantProfileForm = {
  name: '',
  address: '',
  working_time_from: '09:00',
  working_time_from_period: 'AM',
  working_time_to: '10:00',
  working_time_to_period: 'PM',
  phone: '',
  cuisines: [],
  profilepic: '',
  verificationStatus: undefined,
  verificationStep: undefined,
};

export default function RestaurantProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<RestaurantProfileForm>(emptyForm);
  const [mapPickerOpen, setMapPickerOpen] = React.useState(false);

  const handleToggleActive = async () => {
    if (typeof form.is_active !== 'boolean') return;
    const newStatus = !form.is_active;
    setForm((current) => ({ ...current, is_active: newStatus }));
    try {
      await setRestaurantActiveStatus(newStatus);
      await showSuccessAlert(`Restaurant is now ${newStatus ? 'active' : 'inactive'}.`);
    } catch (error) {
      setForm((current) => ({ ...current, is_active: !newStatus }));
      await showErrorAlert(error, 'Failed to update status');
    }
  };

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getRestaurantProfile();
        const parsedWorkingTime = parseWorkingHours(profile?.working_hours || '');

        setForm({
          name: profile?.name || '',
          address: profile?.address || '',
          latitude: profile?.latitude,
          longitude: profile?.longitude,
          working_time_from: profile?.working_time_from || parsedWorkingTime.from || emptyForm.working_time_from,
          working_time_from_period: profile?.working_time_from_period || parsedWorkingTime.fromPeriod || emptyForm.working_time_from_period,
          working_time_to: profile?.working_time_to || parsedWorkingTime.to || emptyForm.working_time_to,
          working_time_to_period: profile?.working_time_to_period || parsedWorkingTime.toPeriod || emptyForm.working_time_to_period,
          phone: profile?.phone || '',
          cuisines: parseCuisines(profile?.cuisine).length ? parseCuisines(profile?.cuisine) : (profile?.primary_category ? [profile.primary_category] : []),
          profilepic: profile?.profilepic || '',
          is_active: typeof profile?.is_active === 'boolean' ? profile.is_active : true,
        });
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurant profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, profilepic: dataUrl }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to read profile image');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateRestaurantProfile({ ...form, cuisine: form.cuisines });
      await showSuccessAlert(result.msg || 'Profile updated successfully.');
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const workingHours = `${form.working_time_from} ${form.working_time_from_period} - ${form.working_time_to} ${form.working_time_to_period}`;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Backend</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Restaurant Profile</h1>
        <p className="text-neutral-500 font-medium">Set opening hours, cuisine, and branding details for your restaurant.</p>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormInput label="Restaurant Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <div className="space-y-2">
                <Label>Address</Label>
                <button
                  type="button"
                  onClick={() => setMapPickerOpen(true)}
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-left flex items-center gap-2 hover:border-[#6EA15C] transition-colors"
                >
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <span className={form.address ? 'text-neutral-900' : 'text-neutral-500'}>
                    {form.address || 'Click to select location on map'}
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <Label>Working Time</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TimeBlock
                    label="From"
                    time={form.working_time_from}
                    period={form.working_time_from_period}
                    onTimeChange={(value) => setForm((current) => ({ ...current, working_time_from: value }))}
                    onPeriodChange={(value) => setForm((current) => ({ ...current, working_time_from_period: value }))}
                  />
                  <TimeBlock
                    label="To"
                    time={form.working_time_to}
                    period={form.working_time_to_period}
                    onTimeChange={(value) => setForm((current) => ({ ...current, working_time_to: value }))}
                    onPeriodChange={(value) => setForm((current) => ({ ...current, working_time_to_period: value }))}
                  />
                </div>
              </div>

              <FormInput label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />

              <CuisineMultiSelect
                selected={form.cuisines}
                onChange={(cuisines) => setForm((current) => ({ ...current, cuisines }))}
              />

              {/* New Camera Upload Section */}
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="relative cursor-pointer group"
                  >
                    <div className="w-32 h-32 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden flex items-center justify-center group-hover:bg-neutral-50 transition-colors">
                      {form.profilepic ? (
                        <img
                          src={form.profilepic}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-neutral-400 flex flex-col items-center gap-1">
                          <CameraIcon />
                          <span className="text-xs font-medium">Upload</span>
                        </div>
                      )}
                    </div>
                    {form.profilepic && (
                      <div className="absolute bottom-0 right-0 bg-[#6EA15C] rounded-full p-1.5 shadow-md">
                        <CameraIcon />
                      </div>
                    )}
                  </label>
                  <p className="text-xs text-neutral-400 mt-2">
                    Click to select restaurant image
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || loading} className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide">
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Preview</p>
              <div className="rounded-[32px] overflow-hidden bg-[#f7f7f2] border border-neutral-100">
                <div className="h-64 bg-neutral-200">
                  <img
                    src={form.profilepic || 'https://picsum.photos/seed/restaurant-profile/900/600'}
                    alt={form.name || 'Restaurant preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h2 className="text-3xl font-black tracking-tight text-neutral-900">{form.name || 'Restaurant name'}</h2>
                  <p className="text-neutral-500 font-medium">{form.address || 'Address will appear here.'}</p>
                  <div className="flex flex-row gap-3 text-sm font-medium text-neutral-600">
                    <div className="rounded-2xl bg-white p-4">Hours: {workingHours}</div>
                    <div className="rounded-2xl bg-white p-4">Phone: {form.phone || 'Not set'}</div>
                    <div className="rounded-2xl bg-white p-4">Cuisine: {form.cuisines.length ? form.cuisines.join(', ') : 'Not set'}</div>
                    <div className="rounded-2xl bg-white p-4 flex items-center gap-2">
                      <span>Status: </span>
                      <span className={form.is_active ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{form.is_active ? 'Active' : 'Inactive'}</span>
                      <button
                        type="button"
                        className="ml-2 px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300 text-xs font-bold"
                        onClick={handleToggleActive}
                        disabled={isSubmitting || loading}
                      >
                        {form.is_active ? 'Set Inactive' : 'Set Active'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <MapPicker
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelect={(address, lat, lng) => {
          setForm(prev => ({
            ...prev,
            address,
            latitude: lat,
            longitude: lng
          }));
        }}
        initialLat={form.latitude}
        initialLng={form.longitude}
      />
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Input placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TimeBlock({
  label,
  time,
  period,
  onTimeChange,
  onPeriodChange,
}: {
  label: string;
  time: string;
  period: string;
  onTimeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#6EA15C]"
        >
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
          className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium outline-none focus:border-[#6EA15C]"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

function buildTimeOptions() {
  const options: string[] = [];
  for (let hour = 1; hour <= 12; hour += 1) {
    ['00', '30'].forEach((minute) => {
      options.push(`${String(hour).padStart(2, '0')}:${minute}`);
    });
  }
  return options;
}

function CuisineMultiSelect({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = CUISINE_OPTIONS.filter(
    (c) => c.toLowerCase().includes(query.toLowerCase()) && !selected.includes(c)
  );

  const toggle = (cuisine: string) => {
    onChange(selected.includes(cuisine) ? selected.filter((c) => c !== cuisine) : [...selected, cuisine]);
  };

  return (
    <div className="space-y-2" ref={ref}>
      <Label>Cuisine</Label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((c) => (
            <span key={c} className="flex items-center gap-1 bg-[#6EA15C]/10 text-[#6EA15C] text-xs font-bold px-3 py-1.5 rounded-full border border-[#6EA15C]/30">
              {c}
              <button type="button" onClick={() => toggle(c)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-white text-left flex items-center justify-between hover:border-[#6EA15C] transition-colors"
        >
          <span className="text-neutral-500 text-sm">{selected.length === 0 ? 'Select cuisines...' : `${selected.length} selected`}</span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50">
            <div className="p-2 border-b border-neutral-100">
              <Input
                autoFocus
                placeholder="Search cuisines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="max-h-52 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-neutral-400">No cuisines found</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={() => { toggle(c); setQuery(''); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 transition-colors text-neutral-700"
                  >
                    {c}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function parseWorkingHours(value: string) {
  const match = /^\s*(\d{1,2}:\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)\s*$/i.exec(value || '');
  if (!match) {
    return { from: '', fromPeriod: '', to: '', toPeriod: '' };
  }

  return {
    from: match[1].padStart(5, '0'),
    fromPeriod: match[2].toUpperCase(),
    to: match[3].padStart(5, '0'),
    toPeriod: match[4].toUpperCase(),
  };
}
