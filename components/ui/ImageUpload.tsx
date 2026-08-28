'use client';

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getSession } from '@/lib/auth';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: 'avatars' | 'shops' | 'products' | 'general';
  label?: string;
  helperText?: string;
  shape?: 'square' | 'circle' | 'banner';
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Upload Image',
  helperText = 'PNG, JPG, WEBP up to 10MB',
  shape = 'square',
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const { session } = await getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image';
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
  };

  const roundedClasses =
    shape === 'circle'
      ? 'rounded-full w-28 h-28 mx-auto'
      : shape === 'banner'
      ? 'rounded-2xl w-full h-40'
      : 'rounded-2xl w-full aspect-square max-w-[200px]';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-800">{label}</label>}

      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed border-slate-300 hover:border-[#087443] bg-slate-50 hover:bg-[#E8F5EF]/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group ${roundedClasses}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay with action */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Change
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : isUploading ? (
          <div className="text-center p-4 space-y-1.5">
            <Loader2 className="w-6 h-6 text-[#087443] animate-spin mx-auto" />
            <p className="text-[11px] font-semibold text-[#087443]">Uploading photo...</p>
          </div>
        ) : (
          <div className="text-center p-4 space-y-1.5 text-slate-500 group-hover:text-[#087443] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto text-slate-600 group-hover:text-[#087443] group-hover:border-[#087443]/30 transition-all">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 group-hover:text-[#087443]">
                + Tap to Upload Photo
              </p>
              {helperText && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
