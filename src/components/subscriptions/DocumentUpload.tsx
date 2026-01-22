'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Upload, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DocumentUploadProps {
    subscriptionId: string;
}

export function DocumentUpload({ subscriptionId }: DocumentUploadProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow selecting the same file again
        e.target.value = '';

        if (file.size > 2 * 1024 * 1024) {
            alert('檔案大小不能超過 2MB');
            return;
        }

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;

                const res = await fetch('/api/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscriptionId,
                        file: base64,
                        fileName: file.name,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Upload failed');
                }

                router.refresh();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload error:', error);
            alert('上傳失敗，請稍後再試');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                    <Upload className="mr-2" size={16} />
                )}
                {isUploading ? '上傳中...' : '上傳文件'}
            </Button>
        </div>
    );
}
