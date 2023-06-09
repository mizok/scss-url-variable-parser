import { last } from 'lodash';
import * as SASS from 'sass';
import { ParseOptions } from './interface'
import { generateId } from './utils';
import * as variableTemplates from './variable-templates'

function constructEvaluationSass(
  variableNames: string[],
  indented?: boolean
): string {
  const asClasses = variableNames
    .map(name => {
      const fn = indented ? variableTemplates.sass : variableTemplates.scss;
      return fn(name);
    })
    .join('\n');

  return asClasses;
}

export default function renderValuesToCSS(
  sass: string,
  variableNames: string[],
  { cwd, indented }: ParseOptions
) {
  const separator = `/* separator-${generateId()} */`;

  const evaluationSass = constructEvaluationSass(variableNames, indented);

  // Set current working directory for @imports
  if (cwd) {
    process.chdir(cwd);
  }

  const constructedSass = [sass, evaluationSass].join('\n');

  const css = SASS
    .renderSync({
      data: constructedSass,
      indentedSyntax: Boolean(indented)
    })
    .css.toString();

  return css;
}
