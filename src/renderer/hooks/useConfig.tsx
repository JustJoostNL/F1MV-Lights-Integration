import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ipcRenderer } from "electron";
import { defaultConfig } from "../../shared/config/defaultConfig";
import { IConfig } from "../../shared/config/IConfig";

export const ConfigContext = createContext<IConfig>(defaultConfig);
export function useConfig() {
  const currentConfig = useContext(ConfigContext);

  const setConfig = useCallback(async (config: IConfig) => {
    await window.f1mvli.config.set(config);
  }, []);

  const updateConfig = useCallback(async (config: Partial<IConfig>) => {
    await window.f1mvli.config.set({ ...currentConfig, ...config });
  }, [currentConfig]);

  return {
    config: currentConfig,
    setConfig,
    updateConfig,
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<IConfig>(defaultConfig);

  useEffect(() => {

    const onChange = (event, config: IConfig) => {
      setConfig({ ...defaultConfig, ...config });
    };

    ipcRenderer.on("f1mvli:config:change", onChange);

    return () => {
      ipcRenderer.removeListener("f1mvli:config:change", onChange);
    };
  }, []);

  useEffect(() => {
    window.f1mvli.config
      .get()
      .then((config) => setConfig({ ...defaultConfig, ...config }));
  }, []);

  return (
    <ConfigContext.Provider
      value={config}
    >
      {children}
    </ConfigContext.Provider>
  );
}
