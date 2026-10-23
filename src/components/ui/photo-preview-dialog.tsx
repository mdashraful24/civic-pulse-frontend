"use client";

import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function PhotoPreviewDialog({
  open,
  title,
  description,
  previewUrl,
  fileName,
  uploading,
  onCancel,
  onUpload,
}: {
  open: boolean;
  title: string;
  description?: string;
  previewUrl: string | null;
  fileName?: string;
  uploading?: boolean;
  onCancel: () => void;
  onUpload: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={onUpload} loading={uploading}>
            Upload photo
          </Button>
        </>
      }
    >
      <div className="overflow-hidden rounded-xl border border-line bg-stone-50">
        {previewUrl ? (
          // biome-ignore lint/performance/noImgElement: local object URL preview
          <img
            src={previewUrl}
            alt="Selected preview"
            className="max-h-80 w-full object-contain"
          />
        ) : (
          <div className="flex h-48 items-center justify-center text-stone-400">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-stone-500">
        {fileName ? `${fileName} · ` : ""}Nothing is uploaded until you confirm.
      </p>
    </Modal>
  );
}
