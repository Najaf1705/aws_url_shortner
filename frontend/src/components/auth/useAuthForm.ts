import { useEffect, useRef, useState, type ChangeEvent } from "react";

export function useAuthForm() {
  const [err, setErr] = useState<string[]>([]);
  const [errEntities, setErrEntities] = useState<string | null>(null);

  const handleChange = (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setErr([]);
      setErrEntities(null);
    };

  const setFieldError = (field: string | null, messages: string[] = []) => {
    setErr(messages);
    setErrEntities(field);
  };

  return {
    err,
    setErr,
    errEntities,
    setErrEntities,
    handleChange,
    setFieldError,
  } as const;
}

export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
