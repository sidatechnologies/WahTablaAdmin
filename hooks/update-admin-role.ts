import { updateAdminRole } from '@/lib/actions/update-admin-role';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useUpdateAdminRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminId, role }: { adminId: number; role: 'user' | 'admin' | 'moderator' | 'superadmin' }) =>
      updateAdminRole(adminId, role),

    onSuccess: (result) => {
      if (result.success) {
        toast.success('Role updated successfully');
        queryClient.invalidateQueries({ queryKey: ['fetch-all-admins'] });
      } else {
        toast.error(result.error || 'Failed to update role');
      }
    },

    onError: (error) => {
      console.error('Update failed:', error);
      toast.error('Something went wrong while updating the role.');
    },
  });
}