import { snakeCase, forEach, mapKeys } from 'lodash';

interface AnyObject {
  [key: string]: any;
}

// Finds all matches of regex in a string
export function findAll(str: string, regex: RegExp): RegExpExecArray[] {
  const result = [];

  const next = () => regex.exec(str);
  let found = next();
  while (found !== null) {
    result.push(found);
    found = next();
  }

  return result;
}

// Generates 8-symbols long id
export function generateId(): string {
  return Math.random()
    .toString(36)
    .slice(-8);
}

export function formatDeep<T = object>(object: T): T {
  const newObj = mapKeys(object as AnyObject, (__, key) => snakeCase(key).toUpperCase());
  forEach(newObj, (value, key) => {
    if (typeof value === 'object') {
      newObj[key] = formatDeep(value);
    }
  });
  return newObj as T;
}
