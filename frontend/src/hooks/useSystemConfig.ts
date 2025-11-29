import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSystemConfig, updateSystemConfig } from '../api/services';
import type { AppSettings, SystemConfigResponse } from '../api/types';

const MODULE_MAP: Record<keyof AppSettings['modules'], string> = {
  modified: 'MODIFIED',
  sexual: 'SEXUAL',
  privacy: 'PRIVACY',
  aggression: 'AGGRESSION',
  political: 'POLITICAL',
  spam: 'SPAM',
  family: 'FAMILY',
};

const transformToAppSettings = (data: SystemConfigResponse): AppSettings => {
  const modules: AppSettings['modules'] = {
    modified: false,
    sexual: false,
    privacy: false,
    aggression: false,
    political: false,
    spam: false,
    family: false,
  };

  (Object.keys(MODULE_MAP) as Array<keyof typeof MODULE_MAP>).forEach((uiKey) => {
    const backendKey = MODULE_MAP[uiKey];
    if (data.enabled_modules.includes(backendKey)) {
      modules[uiKey] = true;
    }
  });

  return {
    intensity: data.security_level,
    modules,
    whiteList: [], 
    blackList: [],
  };
};

const transformToBackendUpdate = (settings: AppSettings) => {
  const enabled_modules: string[] = [];

  (Object.keys(settings.modules) as Array<keyof typeof settings.modules>).forEach((uiKey) => {
    if (settings.modules[uiKey]) {
      enabled_modules.push(MODULE_MAP[uiKey]);
    }
  });

  return {
    security_level: settings.intensity,
    enabled_modules,
    // risk_threshold나 use_detail_ai는 intensity에 따라 자동 계산하거나
    // 별도 로직이 필요하다면 여기서 추가합니다. 일단 null로 두거나 생략하면 백엔드 값 유지.
  };
};

// [Hook] 설정 불러오기
export const useSettings = () => {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: fetchSystemConfig,
    select: transformToAppSettings, // 받아온 데이터를 UI용으로 즉시 변환
    staleTime: 0, // 항상 최신 설정 확인
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSettings: AppSettings) => {
      const payload = transformToBackendUpdate(newSettings);
      return updateSystemConfig(payload);
    },
   
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};