import { uniq } from 'lodash';
import { findAll } from './utils';
import { stripJsonComments } from './stripe-json-comment';

export default function getVariableNames(content: string): string[] {
  const variableRegex = /\$([^:$})\s]+):/g;

  const matches = findAll(stripJsonComments(content), variableRegex);
  const variables = matches.map(found => found[1].trim());
  return uniq(variables);
}

