import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { defaultConfig } from "../../shared/config/defaultConfig";
import { IConfig } from "../../shared/config/config_types";

export const ConfigContext = createContext<IConfig>(defaultConfig);
export function useConfig() {
  const currentConfig = useContext(ConfigContext);

  const setConfig = useCallback(async (config: IConfig) => {
    await window.f1mvli.config.set(config);
  }, []);

  const updateConfig = useCallback(
    async (config: Partial<IConfig>) => {
      await window.f1mvli.config.set({ ...currentConfig, ...config });
    },
    [currentConfig],
  );

  return {
    config: currentConfig,
    setConfig,
    updateConfig,
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<IConfig>(defaultConfig);

  useEffect(() => {
    const configChangeHandler = (newConfig: Partial<IConfig>) => {
      setConfig({ ...defaultConfig, ...newConfig });
    };

    const unsubscribe = window.f1mvli.config.on(
      "f1mvli:config:change",
      configChangeHandler,
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    window.f1mvli.config
      .get()
      .then((newConfig) => setConfig({ ...defaultConfig, ...newConfig }));
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
