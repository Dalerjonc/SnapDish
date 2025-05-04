import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to store the user's photo temporarily as a data URL
export function storePhotoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('userPhotoDataUrl', dataUrl);
      resolve(dataUrl);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

// Function to get the stored photo data URL
export function getStoredPhotoDataUrl(): string | null {
  return localStorage.getItem('userPhotoDataUrl');
}

// Function to clear the stored photo
export function clearStoredPhotoDataUrl(): void {
  localStorage.removeItem('userPhotoDataUrl');
}
