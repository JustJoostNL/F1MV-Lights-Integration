import { useState, useEffect } from "react";

export function useRunOnceOnMount(
  fn: () => void,
  deps: any[] = [],
  skip: boolean = false,
) {
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun || skip) return;

    setHasRun(true);
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, skip, hasRun, ...deps]);
}
