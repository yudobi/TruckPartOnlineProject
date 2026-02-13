import { useMutation } from '@tanstack/react-query';
import authService from '@/services/auth';
import type { RegisterCredentials, RegisterResponse } from '@/types/auth';

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterCredentials>({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
  });
};
