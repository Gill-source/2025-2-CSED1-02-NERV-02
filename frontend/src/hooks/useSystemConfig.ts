import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSystemConfig, updateSystemConfig, addDictionaryWord, fetchDictionary, updateDictionary } from '../api/services';
import type { AppSettings, SystemConfigResponse, DictionaryRequest, DictionaryResponse, DictionaryUpdate } from '../api/types';

const MODULE_MAP: Record<keyof AppSettings['modules'], string> = {
  modified: 'MODIFIED',
  sexual: 'SEXUAL',
  privacy: 'PRIVACY',
  aggression: 'AGGRESSION',
  political: 'POLITICAL',
  spam: 'SPAM',
  family: 'FAMILY',
};

// [기본값 정의] 서버 에러 시 보여줄 기본 설정
const DEFAULT_SETTINGS: AppSettings = {
  intensity: 3,
  modules: {
    modified: false,
    sexual: false,
    privacy: false,
    aggression: false,
    political: false,
    spam: false,
    family: false,
  },
  // [수정] 화이트/블랙리스트 제거 완료 (Dictionary API로 이동됨)
};

// [변환기] 백엔드 -> 프론트엔드
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
    // [수정] 여기서도 whiteList, blackList 리턴하던 코드 삭제!
  };
};

// [변환기] 프론트엔드 -> 백엔드
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
  };
};

// 1. 설정 조회 Hook (Config API)
export const useSettings = () => {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: fetchSystemConfig,
    select: transformToAppSettings,
    // 초기값에서 SystemConfigResponse 형태를 맞춰줌
    initialData: { 
      security_level: 3, 
      enabled_modules: [], 
      risk_threshold: 0, 
      use_detail_ai_model: false,
      // 백엔드 응답엔 아직 whitelist 필드가 남아있을 수 있으니 빈 배열로 둠 (타입 맞춤용)
      whitelist: [], 
      blacklist: []
    } as SystemConfigResponse, 
    staleTime: Infinity,
  });
};

// 2. 설정 업데이트 Hook (Config API)
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSettings: AppSettings) => {
      const payload = transformToBackendUpdate(newSettings);
      return updateSystemConfig(payload);
    },
    
    // 낙관적 업데이트
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['system-config'] });
      // const previousSettings = queryClient.getQueryData(['system-config']); 

      // 캐시 강제 업데이트
      queryClient.setQueryData(['system-config'], newSettings); // 이제 타입이 딱 맞습니다.

      // return { previousSettings };
    },

    onError: (err) => {
      console.error("설정 저장 실패 (화면 유지):", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};

// 1. 조회 Hook
export const useDictionary = () => {
  return useQuery({
    queryKey: ['system-dictionary'],
    queryFn: fetchDictionary,
    // [중요] 서버 데이터가 없어도(에러 시) 빈 배열로 시작해서 화면이 안 죽게 함
    initialData: { whitelist: [], blacklist: [] } as DictionaryResponse,
    staleTime: Infinity, // 오프라인 상태에서 데이터가 자꾸 사라지는 것 방지
  });
};

// 2. 추가 Hook (POST) - [서버 죽어도 화면엔 추가됨]
export const useAddDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: DictionaryRequest) => addDictionaryWord(req),
    
    // [1] 요청 즉시 화면(캐시) 업데이트 (낙관적 업데이트)
    onMutate: async (newWordReq) => {
      await queryClient.cancelQueries({ queryKey: ['system-dictionary'] });

      // 이전 데이터 스냅샷 (필요 없으면 안 써도 됨)
      const previousData = queryClient.getQueryData<DictionaryResponse>(['system-dictionary']);

      // 캐시 강제 업데이트!
      queryClient.setQueryData<DictionaryResponse>(['system-dictionary'], (old) => {
        // 기존 데이터가 없으면 빈 배열로 초기화
        const current = old || { whitelist: [], blacklist: [] };
        
        const isWhite = newWordReq.list_type === 'whitelist';
        return {
          ...current,
          // 배열에 새 단어들을 즉시 추가
          whitelist: isWhite ? [...current.whitelist, ...newWordReq.words] : current.whitelist,
          blacklist: !isWhite ? [...current.blacklist, ...newWordReq.words] : current.blacklist,
        };
      });

      return { previousData };
    },
    
    // [2] 여기가 핵심! 에러가 나도 롤백(Rollback) 하지 않음
    onError: (err, newWord, context) => {
      console.error("서버 연결 실패 (하지만 화면엔 남겨둠):", err);
      
      // ❌ 아래 코드를 지우거나 주석 처리하세요! 
      // if (context?.previousData) {
      //   queryClient.setQueryData(['system-dictionary'], context.previousData);
      // }

      // 대신 사용자에게 살짝 알려줄 수는 있음 (선택사항)
      // alert("서버와 연결되지 않아 임시로 저장되었습니다."); 
    },

    // [3] 성공/실패 후 처리
    onSettled: () => {
      // 서버가 살아있다면 최신 데이터를 받아오겠지만, 
      // 죽어있다면 위에서 강제로 넣은 데이터가 그대로 화면에 남습니다.
      queryClient.invalidateQueries({ queryKey: ['system-dictionary'] });
    },
  });
};

// 3. 수정/삭제 Hook (PATCH) - [서버 죽어도 화면엔 반영됨]
export const useUpdateDictionary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DictionaryUpdate) => updateDictionary(data),
    
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['system-dictionary'] });
      
      queryClient.setQueryData<DictionaryResponse>(['system-dictionary'], (old) => {
        const current = old || { whitelist: [], blacklist: [] };
        return {
          ...current,
          whitelist: newData.whitelist ?? current.whitelist,
          blacklist: newData.blacklist ?? current.blacklist,
        };
      });
    },

    // 역시 에러 발생 시 롤백 코드 제거
    onError: (err) => {
      console.error("서버 연결 실패 (하지만 화면엔 반영됨):", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['system-dictionary'] });
    },
  });
};