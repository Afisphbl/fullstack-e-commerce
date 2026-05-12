import React, { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api-client";
import { ProfileResponse } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ProfilePictureUploadProps {
  currentPhoto?: string;
  userName: string;
  onUploadSuccess?: (newPhotoUrl: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPhoto,
  userName,
  onUploadSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await apiFetch<ProfileResponse>(
        "/api/v1/users/me/upload-photo",
        {
          method: "PATCH",
          body: formData,
        },
      );

      if (response.status === "success") {
        toast.success("Profile picture updated successfully");
        const newUrl = response.data.user.photo;
        onUploadSuccess?.(newUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className='flex flex-col items-center gap-6 p-6 bg-card rounded-xl border shadow-sm'>
      <div className='relative group'>
        <Avatar className='w-32 h-32 border-4 border-background shadow-xl'>
          <AvatarImage
            src={previewUrl || currentPhoto}
            alt={userName}
            className='object-cover'
          />
          <AvatarFallback className='text-3xl bg-primary/10 text-primary'>
            {userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {!previewUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className='absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95'
            title='Change photo'
          >
            <Camera size={20} />
          </button>
        )}
      </div>

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='image/*'
        className='hidden'
      />

      <div className='flex flex-col gap-2 w-full'>
        {previewUrl ? (
          <div className='flex gap-2 w-full'>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className='flex-1 gap-2'
            >
              {isUploading ? (
                <Loader2 className='animate-spin' size={18} />
              ) : (
                <Upload size={18} />
              )}
              {isUploading ? "Uploading..." : "Save Photo"}
            </Button>
            <Button
              variant='outline'
              onClick={cancelPreview}
              disabled={isUploading}
              className='px-3'
            >
              <X size={18} />
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            onClick={() => fileInputRef.current?.click()}
            className='w-full gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all'
          >
            <Camera size={18} />
            Change Profile Picture
          </Button>
        )}
        <p className='text-xs text-muted-foreground text-center'>
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>
    </div>
  );
};
