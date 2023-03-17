import { parse, Stylesheet } from 'css';
import { get } from 'lodash';
import getVariableNames from './get-variable-names';
import renderValuesToCSS from './render-values-to-css';
import { formatDeep } from './utils';
import { ParseOptions } from './interface'
import {stripJsonComments} from './stripe-json-comment';

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

export  function parseUrlVariable(
  sass: string,
  passedOptions: ParseOptions = {}
) {
  const options = { ...passedOptions };
  const variableNames = getVariableNames(sass);
  const stripedScss = stripJsonComments(sass)

  const regex = /(^\s*\$[^:]+\s*:\s.*)(,)?/gm;
  
  let match;
  const newStringArray = [];
  while ((match = regex.exec(stripedScss)) !== null) {
    const newString = match[0].trim();
    newStringArray.push(newString);
  }

  const result = newStringArray.join(';\n')+';';

  const css = renderValuesToCSS(result, variableNames, options);
  if (!css) {
    return {};
  }

  const variables = readValues(css);
  const formattedUrlObject = formatDeep(variables);
  let classPropertyContent = '';
  const urlRegex = /url\((.*?)\)/; // 正規表達式
  Object.keys(formattedUrlObject).forEach((key)=>{
	const  val= formattedUrlObject[key] as string;
	const match = val.match(urlRegex); // 執行檢查
	if (match) {
	const extracted = match[1]; // 取得匹配的部分
	classPropertyContent+=`    ${key}=${extracted};\n`
	} 
  })

  const classStr = `
@Injectable({
  provideIn:'root'
})
class ImageLink {

${classPropertyContent}

}
  `
  return classStr;
}


