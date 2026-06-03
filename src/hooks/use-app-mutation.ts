import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

export function useAppMutation<TData = unknown, TVariables = void>(
  options: UseMutationOptions<TData, Error, TVariables, unknown> & {
    invalidateKeys?: (string | undefined)[][];
  },
) {
  const queryClient = useQueryClient();
  const { invalidateKeys, onSuccess, ...rest } = options;

  return useMutation<TData, Error, TVariables, unknown>({
    ...rest,
    onSuccess(...args) {
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      if (onSuccess) {
        (onSuccess as (...a: unknown[]) => void)(...args);
      }
    },
  });
}
