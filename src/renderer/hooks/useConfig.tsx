import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { defaultConfig } from "../../shared/defaultConfig";
import { IConfig } from "../../shared/types/config";

export const ConfigContext = createContext<IConfig>(defaultConfig);
export function useConfig() {
  const config = useContext(ConfigContext);

  const setConfig = useCallback(async (config: IConfig) => {
    await window.f1mvli.config.set(config);
  }, []);

  const updateConfig = useCallback(
    async (
      partialConfig: Partial<IConfig> | ((config: IConfig) => Partial<IConfig>),
    ) => {
      const updated =
        typeof partialConfig === "function"
          ? partialConfig(config)
          : partialConfig;

      await window.f1mvli.config.update(updated);
    },
    [config],
  );

  return {
    config,
    setConfig,
    updateConfig,
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<IConfig>(defaultConfig);

  useEffect(() => {
    const configChangeHandler = (newConfig: IConfig) => {
      setConfig(newConfig);
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
