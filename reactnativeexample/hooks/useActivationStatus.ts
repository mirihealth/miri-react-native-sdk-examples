/**
 * Temporary stub for useActivationStatus hook.
 * TODO: Remove this file after @miri-ai/miri-react-native@1.129.0 is published
 * and use the hook exported from the SDK instead.
 */
import { useMemo } from 'react';
import { useCareSeeker, useProgram } from '@miri-ai/miri-react-native';

interface Module {
  name?: string;
}

interface UseActivationStatusReturn {
  isActivationComplete: boolean;
  activationModule: Module | undefined;
  isLoading: boolean;
}

// Helper to find activation module from program
const getActivationFlowModule = (program: any): Module | undefined => {
  if (!program?.modules) return undefined;
  return program.modules.find(
    (m: any) =>
      m.name?.toLowerCase().includes('activation') ||
      m.name?.toLowerCase().includes('onboarding'),
  );
};

export const useActivationStatus = (): UseActivationStatusReturn => {
  const { careSeeker, isLoading: isCareSeekerLoading } = useCareSeeker();
  const { program, loading: isProgramLoading } = useProgram();

  const isActivationComplete = useMemo(() => {
    return !!careSeeker?.completedOnboardingAt;
  }, [careSeeker?.completedOnboardingAt]);

  const activationModule = useMemo(() => {
    return getActivationFlowModule(program);
  }, [program]);

  return {
    isActivationComplete,
    activationModule,
    isLoading: isCareSeekerLoading || isProgramLoading,
  };
};
