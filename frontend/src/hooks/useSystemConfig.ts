import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSystemConfig, updateSystemConfig, addDictionaryWord, fetchDictionary, deleteDictionaryWord } from '../api/services';
import type { AppSettings, SystemConfigResponse, DictionaryRequest } from '../api/types';

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
// const DEFAULT_SETTINGS: AppSettings = {
//   intensity: 3,
//   modules: {
//     modified: false,
//     sexual: false,
//     privacy: false,
//     aggression: false,
//     political: false,
//     spam: false,
//     family: false,
//   },
// };

const MOCK_DICTIONARY = {
  whitelist: [],
  blacklist: []
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
    queryFn: async () => {
      try {
        // 백엔드 스펙상 따로 조회해야 하므로 Promise.all로 병렬 처리
        const [whiteRes, blackRes] = await Promise.all([
          fetchDictionary('whitelist'),
          fetchDictionary('blacklist')
        ]);
        
        // 두 결과를 하나의 객체로 병합하여 반환 (UI 편의성)
        return {
          whitelist: whiteRes.whitelist || [],
          blacklist: blackRes.blacklist || []
        };
      } catch (error) {
        console.warn("서버 연결 실패, 목 데이터를 반환합니다.");
        return MOCK_DICTIONARY;
      }
    },
    initialData: MOCK_DICTIONARY,
    staleTime: Infinity,
  });
};

// 2. 추가 Hook (POST) - [서버 죽어도 화면엔 추가됨]
export const useAddDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: DictionaryRequest) => addDictionaryWord(req),
    
    // 낙관적 업데이트 (추가)
    onMutate: async (newWordReq) => {
      await queryClient.cancelQueries({ queryKey: ['system-dictionary'] });
      
      queryClient.setQueryData(['system-dictionary'], (old: any) => {
        const current = old || { whitelist: [], blacklist: [] };
        const isWhite = newWordReq.list_type === 'whitelist';
        
        return {
          ...current,
          whitelist: isWhite ? [...current.whitelist, ...newWordReq.words] : current.whitelist,
          blacklist: !isWhite ? [...current.blacklist, ...newWordReq.words] : current.blacklist,
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['system-dictionary'] }),
  });
};

// 3. 삭제 Hook (DELETE) - [서버 죽어도 화면엔 반영됨]
export const useDeleteDictionaryWord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: DictionaryRequest) => deleteDictionaryWord(req),
    
    // 낙관적 업데이트 (삭제)
    onMutate: async (delWordReq) => {
      await queryClient.cancelQueries({ queryKey: ['system-dictionary'] });

      queryClient.setQueryData(['system-dictionary'], (old: any) => {
        const current = old || { whitelist: [], blacklist: [] };
        const isWhite = delWordReq.list_type === 'whitelist';
        const targetWords = delWordReq.words; // 삭제할 단어들

        return {
          ...current,
          // filter를 사용해 삭제할 단어들을 제외시킴
          whitelist: isWhite 
            ? current.whitelist.filter((w: string) => !targetWords.includes(w)) 
            : current.whitelist,
          blacklist: !isWhite 
            ? current.blacklist.filter((w: string) => !targetWords.includes(w)) 
            : current.blacklist,
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['system-dictionary'] }),
  });
};