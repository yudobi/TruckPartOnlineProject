import { useMutation } from '@tanstack/react-query';
import authService from '@/services/auth';

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: ({ uid, token }: { uid: string; token: string }) => 
      authService.verifyEmail(uid, token),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
};
