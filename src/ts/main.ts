import { parse, Stylesheet } from 'css';
import { get } from 'lodash';
import getVariableNames from './lib/get-variable-names';
import renderValuesToCSS from './lib/render-values-to-css';
import { camelizeDeep } from './lib/utils';
import { ParseOptions } from './lib/interface'

interface VarsOneLevelDeep {
  [key: string]: string;
}
interface Vars {
  [key: string]: string | VarsOneLevelDeep;
}

function removeLeadingDot(str: string): string {
  return str.replace(/^\.?/, '');
}

function removeMapTail(str: string): string {
  return str.replace(/\[is-map\]$/, '');
}

function unquote(str: string): string {
  return str.replace(/^"(.*)"$/, '$1');
}

function nameFromSelector(selector: string): string {
  const noDot = removeLeadingDot(selector);
  const name = removeMapTail(noDot);
  return name;
}

function readValues(css: string): Vars {
  const ast:Stylesheet = parse(css);

  const variables: Vars = {};

  if (!ast.stylesheet) {
    return variables;
  }

  ast.stylesheet.rules.forEach(rule => {
    const selector = get(rule, 'selectors[0]');
    const name = nameFromSelector(selector);
    const value = get(rule, 'declarations[0].value');

    // @ts-ignore: Unreachable code error
    if (selector.endsWith('[is-map]')) {
      const map: VarsOneLevelDeep = (variables[name] as VarsOneLevelDeep) || {};
      const key = get(rule, 'declarations[0].property', '');
      map[key] = unquote(value);
      variables[name] = map;
    } else {
      variables[name] = value;
    }
    
  });

  return variables;
}

export default function parseVariable(
  sass: string,
  passedOptions: ParseOptions = {}
): Vars {
  const options = { camelCase: true, ...passedOptions };

  const variableNames = getVariableNames(sass);

  const css = renderValuesToCSS(sass, variableNames, options);
  if (!css) {
    return {};
  }
  const variables = readValues(css);

  return options.camelCase ? camelizeDeep(variables) : variables;
}
