import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  title: string;
  description: string;
  className?: string;
  isProcessing?: boolean;
}

const ImageUploader = ({ onImageSelect, title, description, className = "", isProcessing = false }: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        
        // Convert to a supported format (JPEG) if needed
        convertToSupportedFormat(file, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Convert file to a supported format (JPEG) regardless of input format
  const convertToSupportedFormat = (file: File, dataUrl: string) => {
    // Create an image element to load the data
    const img = new Image();
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPEG format
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file with JPEG format
            const convertedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, "") + ".jpeg", 
              { type: "image/jpeg" }
            );
            console.log("Converted image to JPEG format:", convertedFile);
            onImageSelect(convertedFile);
          }
        }, 'image/jpeg', 0.9);
      }
    };
    
    // Set source to load the image
    img.src = dataUrl;
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openCamera = async () => {
    try {
      // Close existing camera if it's active
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }

      // Get new camera stream
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(newStream);
      setIsCameraActive(true);
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please try uploading an image instead.");
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          onImageSelect(file);
          setPreviewUrl(URL.createObjectURL(blob));
        }
        
        // Close camera
        closeCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const closeCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const cancelCamera = () => {
    closeCamera();
  };

  return (
    <div className={`bg-neutral-100 dark:bg-gray-800 rounded-xl p-6 text-center ${className}`}>
      <div className="border-2 border-dashed border-neutral-300 dark:border-gray-600 rounded-xl p-4 md:p-8 mb-4 flex flex-col items-center justify-center">
        {isCameraActive ? (
          <div className="w-full relative mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="mx-auto max-h-60 rounded-lg border border-gray-300 dark:border-gray-700"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="mt-4 flex justify-center space-x-3">
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-full text-sm flex items-center"
                onClick={takePhoto}
              >
                <i className="ri-camera-line mr-1"></i> Take Photo
              </Button>
              
              <Button 
                variant="default" 
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-full text-sm flex items-center"
                onClick={cancelCamera}
              >
                <i className="ri-close-line mr-1"></i> Cancel
              </Button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="w-full mb-4 relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className={`mx-auto max-h-48 rounded-lg ${isProcessing ? 'opacity-60 filter blur-[1px]' : ''}`} 
            />
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <div className="w-10 h-10 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin"></div>
                </div>
                <div className="mt-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <p className="text-sm font-medium text-neutral-800">Scanning image and analyzing ingredients...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <i className="ri-camera-3-line text-5xl text-neutral-400 dark:text-gray-500 mb-4"></i>
        )}
        
        {!isCameraActive && (
          <>
            <p className="text-neutral-600 dark:text-gray-300 mb-2">{title}</p>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mb-4">{description}</p>
            
            <div className="flex space-x-3">
              <Button 
                variant="default" 
                className="bg-primary text-white font-medium py-2 px-5 rounded-full text-sm flex items-center"
                onClick={openCamera}
              >
                <i className="ri-camera-line mr-1"></i> Camera
              </Button>
              
              <Button 
                variant="default" 
                className="bg-secondary text-white font-medium py-2 px-5 rounded-full text-sm flex items-center"
                onClick={triggerFileInput}
              >
                <i className="ri-image-line mr-1"></i> Upload
              </Button>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
