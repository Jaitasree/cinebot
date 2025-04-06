
import { toast } from "@/hooks/use-toast";

/**
 * Toast service to display notifications
 */
export const toastService = {
  /**
   * Show a success notification
   */
  success: (message: string, title = "Success") => {
    toast({
      title,
      description: message,
      variant: "default",
      duration: 3000,
    });
  },

  /**
   * Show an error notification
   */
  error: (message: string, title = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive",
      duration: 5000,
    });
  },

  /**
   * Show an info notification
   */
  info: (message: string, title = "Information") => {
    toast({
      title,
      description: message,
      duration: 3000,
    });
  },
};
