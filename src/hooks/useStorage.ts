import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type BucketName = "avatars" | "post-images" | "course-thumbnails";

export function useStorage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    bucket: BucketName,
    file: File,
    path?: string
  ): Promise<string | null> => {
    if (!user) {
      console.error("User must be authenticated to upload files");
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = path ? `${user.id}/${path}/${fileName}` : `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (bucket: BucketName, url: string): Promise<boolean> => {
    if (!user) {
      console.error("User must be authenticated to delete files");
      return false;
    }

    try {
      // Extract the path from the URL
      const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
      if (urlParts.length < 2) {
        console.error("Invalid file URL");
        return false;
      }

      const filePath = decodeURIComponent(urlParts[1]);
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    return uploadFile("avatars", file);
  };

  const uploadPostImage = async (file: File): Promise<string | null> => {
    return uploadFile("post-images", file);
  };

  const uploadCourseThumbnail = async (file: File): Promise<string | null> => {
    return uploadFile("course-thumbnails", file);
  };

  return {
    uploading,
    uploadFile,
    deleteFile,
    uploadAvatar,
    uploadPostImage,
    uploadCourseThumbnail,
  };
}
