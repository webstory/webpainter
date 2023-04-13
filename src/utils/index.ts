type Nullable<T> = T | undefined | null;

export const cssStringify = (obj: Nullable<Record<string, Nullable<string | number>> | string>): string => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;

  return Object.entries(obj)
    .filter(([, value]) => (!value ? false : true))
    .map(([key, value]) => {
      if (typeof value === 'number') return `${key}:${value}px;`;
      return `${key}:${value};`;
    })
    .join('');
};
