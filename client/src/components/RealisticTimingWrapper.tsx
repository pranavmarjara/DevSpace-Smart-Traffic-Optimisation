import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";

interface RealisticTimingWrapperProps {
  children: React.ReactNode;
  onAction: () => Promise<any> | any;
  actionLabel: string;
  minDelay?: number; // minimum delay in seconds
  maxDelay?: number; // maximum delay in seconds
  processingMessage?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function RealisticTimingWrapper({
  children,
  onAction,
  actionLabel,
  minDelay = 2,
  maxDelay = 8,
  processingMessage,
  className = "",
  variant = "default",
  size = "default"
}: RealisticTimingWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleAction = async () => {
    setIsProcessing(true);
    
    // Calculate random delay between min and max
    const delaySeconds = minDelay + Math.random() * (maxDelay - minDelay);
    const delayMs = Math.floor(delaySeconds * 1000);
    
    // Start countdown
    setCountdown(Math.ceil(delaySeconds));
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Add realistic processing delay
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    try {
      // Execute the actual action
      await onAction();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      clearInterval(countdownInterval);
      setIsProcessing(false);
      setCountdown(0);
    }
  };

  if (React.isValidElement(children) && children.type === Button) {
    // If child is a Button, enhance it with realistic timing
    return (
      <Button
        {...children.props}
        onClick={handleAction}
        disabled={isProcessing || children.props.disabled}
        className={`${children.props.className || ''} ${className}`}
        variant={variant}
        size={size}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {processingMessage || `Processing...`}
            {countdown > 0 && (
              <span className="ml-2 text-sm">
                ({countdown}s)
              </span>
            )}
          </>
        ) : (
          children.props.children
        )}
      </Button>
    );
  }

  // For non-Button children, wrap in a realistic timing container
  return (
    <div className={`relative ${className}`}>
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">
                {processingMessage || `${actionLabel}...`}
              </p>
              {countdown > 0 && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Estimated: {countdown} seconds remaining
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div 
        className={`transition-opacity duration-300 ${
          isProcessing ? 'opacity-30 pointer-events-none' : ''
        }`}
        onClick={!isProcessing ? handleAction : undefined}
      >
        {children}
      </div>
    </div>
  );
}