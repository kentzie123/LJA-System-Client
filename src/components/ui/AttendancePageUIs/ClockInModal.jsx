"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  X,
  Camera,
  Clock,
  LogIn,
  LogOut,
  RefreshCcw,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useAttendanceStore } from "@/stores/useAttendanceStore";
import toast from "react-hot-toast";

const ClockInModal = ({ isOpen, onClose, onSuccess }) => {
  const webcamRef = useRef(null);

  // Store actions
  const { clockIn, clockOut, isClocking } = useAttendanceStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState("loading");

  // New State for Retake Feature
  const [imgSrc, setImgSrc] = useState(null);

  // 1. Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Check Status & Reset on Open
  useEffect(() => {
    if (isOpen) {
      checkUserStatus();
      setImgSrc(null); // Reset photo when opening
    } else {
      setStatus("loading");
    }
  }, [isOpen]);

  const checkUserStatus = async () => {
    try {
      const res = await api.get(`/attendances/status/current`);
      setStatus(res.data.status);
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Failed to fetch status");
    }
  };

  // 3. STEP 1: CAPTURE PHOTO
  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    if (image) {
      setImgSrc(image);
    } else {
      toast.error("Camera loading...");
    }
  }, [webcamRef]);

  // 4. RETAKE PHOTO
  const retake = () => {
    setImgSrc(null);
  };

  // 5. STEP 2: CONFIRM & SUBMIT (Handles Location & API)
  const handleConfirm = async () => {
    if (!imgSrc) return toast.error("No photo captured");

    // Helper to process the API call
    const processClocking = async (location) => {
      let success = false;
      if (status === "idle") {
        success = await clockIn(imgSrc, location);
      } else if (status === "clocked_in") {
        success = await clockOut(imgSrc, location);
      }

      if (success) {
        checkUserStatus();
        onSuccess && onSuccess();
        onClose();
      }
    };

    // Get Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          processClocking(location);
        },
        (error) => {
          console.error(error);
          toast.error("Location access required.");
        }
      );
    } else {
      toast.error("Geolocation not supported.");
    }
  };

  if (!isOpen) return null;

  return (
    // FULL SCREEN WRAPPER: Removed padding on mobile (p-0), added padding on desktop (sm:p-4)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      {/* MODAL CARD: Full height/width on mobile (h-[100dvh] w-full rounded-none), specific size on desktop */}
      <div className="bg-base-100 w-full h-[100dvh] sm:h-auto sm:max-w-md sm:rounded-2xl shadow-2xl border-none sm:border border-base-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-base-200 p-6 text-center border-b border-base-300 relative shrink-0">
          <h2 className="text-3xl font-black text-base-content tracking-tight">
            {format(currentTime, "h:mm:ss a")}
          </h2>
          <p className="text-base-content/60 font-medium uppercase tracking-widest text-xs mt-1">
            {format(currentTime, "EEEE, MMMM do, yyyy")}
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Viewport Area (Flex Grow to fill space on mobile) */}
        <div className="relative bg-black flex-grow flex items-center justify-center overflow-hidden aspect-[3/4] sm:aspect-[4/3]">
          {imgSrc ? (
            // PREVIEW MODE
            <img
              src={imgSrc}
              alt="Preview"
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            // LIVE CAMERA MODE
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover transform scale-x-[-1]"
              videoConstraints={{
                facingMode: "user",
                // Mobile-friendly aspect ratio
                aspectRatio: window.innerWidth < 640 ? 0.75 : 1.333,
              }}
            />
          )}

          {/* Overlay Guide (Only in Camera Mode) */}
          {!imgSrc && (
            <>
              <div className="absolute inset-0 border-[30px] border-black/30 pointer-events-none"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                  Face Camera Directly
                </span>
              </div>
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-6 space-y-4 bg-base-100 shrink-0">
          <div className="pt-2">
            {status === "loading" ? (
              <button disabled className="btn w-full btn-lg text-lg gap-3">
                <span className="loading loading-spinner"></span> Checking
                Status...
              </button>
            ) : status === "completed" ? (
              <div className="alert alert-success text-sm font-medium border-l-4 border-l-green-700">
                <Clock className="size-5" />
                <div>
                  <h3 className="font-bold">Shift Completed!</h3>
                  <div className="text-xs">
                    You have already clocked out for today.
                  </div>
                </div>
              </div>
            ) : (
              // ACTION BUTTONS
              <div className="flex flex-col gap-3">
                {/* 1. If Photo Taken -> Show Confirm & Retake */}
                {imgSrc ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={retake}
                      className="btn btn-outline btn-lg text-lg"
                      disabled={isClocking}
                    >
                      <RefreshCcw className="size-5" /> Retake
                    </button>

                    <button
                      onClick={handleConfirm}
                      disabled={isClocking}
                      className={`btn btn-lg text-lg ${
                        status === "idle"
                          ? "btn-success text-white"
                          : "btn-error text-white"
                      }`}
                    >
                      {isClocking ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <>
                          <Check className="size-6" />
                          {status === "idle" ? "Confirm In" : "Confirm Out"}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // 2. If No Photo -> Show Capture Button
                  <button
                    onClick={capture}
                    className="btn w-full btn-lg text-lg gap-3 btn-primary shadow-lg"
                  >
                    <Camera className="size-6" />
                    {status === "idle"
                      ? "Take Photo & Clock In"
                      : "Take Photo & Clock Out"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockInModal;
