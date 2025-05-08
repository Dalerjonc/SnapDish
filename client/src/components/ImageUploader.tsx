import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      const canvasElement = document.createElement('canvas');
      
      videoElement.srcObject = stream;
      videoElement.play();
      
      setTimeout(() => {
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        if (context) {
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        }
        
        // Convert canvas to file
        canvasElement.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            onImageSelect(file);
            setPreviewUrl(URL.createObjectURL(blob));
          }
          
          // Stop all tracks to release camera
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }, 'image/jpeg');
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please try uploading an image instead.");
    }
  };

  return (
    <div className={`glass-card p-6 text-center ${className}`}>
      <div className="border-2 border-dashed border-white/30 dark:border-slate-700/50 backdrop-blur-md rounded-2xl p-8 mb-4 flex flex-col items-center justify-center">
        {previewUrl ? (
          <div className="w-full mb-6 relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className={`mx-auto max-h-48 rounded-2xl shadow-lg ${isProcessing ? 'opacity-60 filter blur-[1px]' : ''}`} 
            />
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="glass p-4 rounded-full shadow-lg">
                  <div className="w-10 h-10 border-4 border-transparent border-t-primary border-r-secondary rounded-full animate-spin"></div>
                </div>
                <div className="mt-4 glass px-6 py-3 rounded-full shadow-lg">
                  <p className="text-sm font-medium gradient-text">Scanning image and analyzing ingredients...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-8 mb-6 rounded-full w-24 h-24 flex items-center justify-center">
            <i className="ri-camera-3-line text-4xl text-primary dark:text-accent"></i>
          </div>
        )}
        
        <h3 className="text-lg font-medium mb-2 gradient-text">{title}</h3>
        <p className="text-sm text-foreground/70 mb-5">{description}</p>
        
        <div className="flex space-x-4">
          <Button 
            variant="default" 
            className="btn-neomorphic bg-gradient-to-r from-primary to-secondary text-white font-medium py-3 px-6 text-sm flex items-center shadow-lg"
            onClick={openCamera}
          >
            <i className="ri-camera-line mr-2"></i> Camera
          </Button>
          
          <Button 
            variant="default" 
            className="btn-neomorphic bg-gradient-to-r from-accent to-secondary text-white font-medium py-3 px-6 text-sm flex items-center shadow-lg"
            onClick={triggerFileInput}
          >
            <i className="ri-image-line mr-2"></i> Upload
          </Button>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
