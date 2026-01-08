import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Crop } from "lucide-react";
import { ImageCropper } from "./ImageCropper";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading?: boolean;
  label?: string;
  enableCrop?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  onUpload,
  uploading = false,
  label = "Upload Image",
  enableCrop = true,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (enableCrop) {
      // Open cropper dialog
      const reader = new FileReader();
      reader.onload = () => {
        setPendingImage(reader.result as string);
        setPendingFile(file);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct upload without crop
      const url = await onUpload(file);
      if (url) {
        onChange(url);
      }
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file for upload
    const fileName = pendingFile?.name || "cropped-image.jpg";
    const croppedFile = new File([croppedBlob], fileName, { type: "image/jpeg" });
    
    const url = await onUpload(croppedFile);
    if (url) {
      onChange(url);
    }
    
    setPendingImage(null);
    setPendingFile(null);
  };

  const handleCropExisting = () => {
    if (value) {
      setPendingImage(value);
      setCropperOpen(true);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {enableCrop && (
              <button
                type="button"
                onClick={handleCropExisting}
                className="p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                title="Crop image"
              >
                <Crop size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-dashed"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {label}
            </>
          )}
        </Button>
      )}

      {pendingImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={pendingImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
