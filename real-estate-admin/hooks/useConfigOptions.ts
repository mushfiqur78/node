/**
 * Hook to fetch all config dropdown options
 * Used in property add/edit form
 */
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Option { _id: string; name: string; [key: string]: any }
interface Feature extends Option { category: string }

interface ConfigOptions {
  propertyTypes: Option[];
  locations:     Option[];
  purposes:      Option[];
  statuses:      Option[];
  features:      Feature[];
  loading:       boolean;
}

export function useConfigOptions(): ConfigOptions {
  const [propertyTypes, setPropertyTypes] = useState<Option[]>([]);
  const [locations,     setLocations]     = useState<Option[]>([]);
  const [purposes,      setPurposes]      = useState<Option[]>([]);
  const [statuses,      setStatuses]      = useState<Option[]>([]);
  const [features,      setFeatures]      = useState<Feature[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [t, l, p, s, f] = await Promise.all([
          api.get('/admin/config/property-types'),
          api.get('/admin/config/locations'),
          api.get('/admin/config/purposes'),
          api.get('/admin/config/statuses'),
          api.get('/admin/config/features'),
        ]);
        setPropertyTypes(t.data.data.items);
        setLocations(l.data.data.items);
        setPurposes(p.data.data.items);
        setStatuses(s.data.data.items);
        setFeatures(f.data.data.items);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return { propertyTypes, locations, purposes, statuses, features, loading };
}
