import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type AdminAction = 'insert' | 'update' | 'upsert' | 'delete';

interface AdminActionParams {
  action: AdminAction;
  table: string;
  data?: Record<string, unknown>;
  recordId?: string;
}

interface AdminActionResult<T> {
  data: T[] | null;
  success: boolean;
  error: string | null;
}

export const useAdminAction = () => {
  const { toast } = useToast();
  const { session, isAdmin } = useAuth();

  const executeAction = async <T = unknown>({
    action,
    table,
    data,
    recordId
  }: AdminActionParams): Promise<AdminActionResult<T>> => {
    // Client-side pre-validation
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to perform this action",
        variant: "destructive"
      });
      return { data: null, success: false, error: "Not authenticated" };
    }

    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Admin privileges required",
        variant: "destructive"
      });
      return { data: null, success: false, error: "Not an admin" };
    }

    try {
      const { data: responseData, error } = await supabase.functions.invoke('admin-action', {
        body: { action, table, data, recordId }
      });

      if (error) {
        console.error('Admin action failed:', error);
        toast({
          title: "Action failed",
          description: error.message || "An error occurred",
          variant: "destructive"
        });
        return { data: null, success: false, error: error.message };
      }

      if (responseData?.error) {
        toast({
          title: "Action failed",
          description: responseData.error,
          variant: "destructive"
        });
        return { data: null, success: false, error: responseData.error };
      }

      return { 
        data: responseData?.data as T[] || null, 
        success: true, 
        error: null 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Action failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, success: false, error: errorMessage };
    }
  };

  return { executeAction };
};
