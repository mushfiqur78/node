'use client';
import { useRef, useState } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';

export interface ImageMeta { file: File; url: string; alt: string; title: string }

interface ImageUploaderProps {
  label:     string;
  multiple?: boolean;
  maxFiles?: number;
  onChange:  (items: ImageMeta[]) => void;
}

export default function ImageUploader({ label, multiple = false, maxFiles = 10, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems]   = useState<ImageMeta[]>([]);
  const [error, setError]   = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const arr = Array.from(files);
    if (multiple && arr.length + items.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }
    const newItems: ImageMeta[] = arr.map(file => ({ file, url: URL.createObjectURL(file), alt: '', title: '' }));
    const updated = multiple ? [...items, ...newItems] : newItems;
    setItems(updated);
    onChange(updated);
  };

  const update = (index: number, field: 'alt' | 'title', value: string) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setItems(updated);
    onChange(updated);
  };

  const remove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };

  // Drag & drop reorder
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...items];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setDragIdx(i);
    setItems(updated);
    onChange(updated);
  };
  const onDragEnd = () => setDragIdx(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 transition"
      >
        <Upload size={22} className="mx-auto text-gray-400 mb-1" />
        <p className="text-sm text-gray-500">Click or drag & drop</p>
        <p className="text-xs text-gray-400 mt-0.5">JPG, JPEG, PNG {multiple ? `(max ${maxFiles})` : '(1 image)'}</p>
      </div>

      <input ref={inputRef} type="file" accept="image/jpg,image/jpeg,image/png"
        multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {items.length > 0 && (
        <div className="mt-3 space-y-3">
          {items.map((item, i) => (
            <div key={i} draggable={multiple} onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)} onDragEnd={onDragEnd}
              className={`flex gap-3 items-start bg-gray-50 rounded-lg p-3 border ${dragIdx === i ? 'opacity-50' : ''}`}>
              {multiple && <GripVertical size={16} className="text-gray-400 mt-2 cursor-grab shrink-0" />}
              <img src={item.url} alt="" className="w-16 h-16 object-cover rounded-lg border shrink-0" />
              <div className="flex-1 space-y-1.5">
                <input placeholder="Alt text (SEO & accessibility)"
                  value={item.alt} onChange={e => update(i, 'alt', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input placeholder="Title (tooltip)"
                  value={item.title} onChange={e => update(i, 'title', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 mt-1 shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
