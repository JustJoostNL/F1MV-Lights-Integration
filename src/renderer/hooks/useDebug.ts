import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function useDebug() {
  const [debug, setDebug] = useState<boolean>(false);

  useHotkeys("shift+d", () => {
    setDebug((prev) => !prev);
  });

  return debug;
}
