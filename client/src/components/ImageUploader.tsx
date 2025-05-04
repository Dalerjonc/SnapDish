import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  title: string;
  description: string;
  className?: string;
}

const ImageUploader = ({ onImageSelect, title, description, className = "" }: ImageUploaderProps) => {
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
    <div className={`bg-neutral-100 rounded-xl p-6 text-center ${className}`}>
      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 mb-4 flex flex-col items-center justify-center">
        {previewUrl ? (
          <div className="w-full mb-4">
            <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
          </div>
        ) : (
          <i className="ri-camera-3-line text-5xl text-neutral-400 mb-4"></i>
        )}
        
        <p className="text-neutral-600 mb-2">{title}</p>
        <p className="text-xs text-neutral-500 mb-4">{description}</p>
        
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
      </div>
    </div>
  );
};

export default ImageUploader;
