import React, { useState } from "react";
import { User, Camera, Check, X, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";

const ProfileHeader = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const { uploadProfilePicture, isUploading } = useUserStore();

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setSelectedFile(file);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onloadend = async () => {
      const base64String = reader.result;
      const success = await uploadProfilePicture(base64String);

      if (success) {
        // Update Global Auth Store
        setAuthUser({ ...authUser, profile_picture: base64String });
        // Reset Local State
        setPreviewImage(null);
        setSelectedFile(null);
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 pt-8 pb-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-base-content">Profile</h1>
        <p className="text-sm text-base-content/60">
          Manage your personal information
        </p>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="relative group">
        <div className="relative">
          {/* Dynamic Image Source */}
          <img
            src={previewImage || authUser?.profile_picture || "/avatar.png"}
            alt="Profile"
            className={`h-48 w-48 object-cover rounded-full border-4 border-base-200 shadow-xl transition-all duration-300 ${
              isUploading ? "opacity-50 blur-sm" : ""
            }`}
          />

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full z-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* CAMERA BUTTON (Hidden if uploading or previewing) */}
        {!previewImage && !isUploading && (
          <label
            htmlFor="profile-upload"
            className="absolute bottom-2 right-2 p-3 bg-base-100 rounded-full shadow-lg border border-base-200 cursor-pointer hover:bg-base-200 hover:scale-105 active:scale-95 transition-all text-base-content/70 hover:text-primary z-10"
          >
            <Camera size={20} />
            <input
              id="profile-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* CONFIRM / CANCEL BUTTONS */}
      {previewImage && !isUploading && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={handleUpload}
            className="btn btn-primary btn-sm gap-2 shadow-lg"
          >
            <Check size={16} /> Update Picture
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      )}

      {/* USER DETAILS SECTION */}
      {!previewImage && (
        <div className="space-y-1 animate-in fade-in duration-500">
          <h2 className="text-xl font-semibold text-base-content">
            {authUser?.fullName || "User Name"}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
            <User size={14} />
            <span>{authUser?.email || "N/A"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
