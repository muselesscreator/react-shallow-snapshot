/* v8 ignore start */
import prettyFormat, { plugins } from 'pretty-format';
import {
  RenderData,
  RenderOutput,
} from './types';

const toSnapshot = (data: RenderOutput): string => {
  console.log({ data });
  if (typeof data === 'string' || typeof data === 'boolean' || data === null) {
    return `${data}`;
  }
  if (Array.isArray(data)) {
    return data.map((value: RenderOutput) => toSnapshot(value)).join('');
  }
  const children = data.children as RenderData[];
  console.log("?");
  return prettyFormat(
    {
      ...data,
      $$typeof: Symbol.for('react.test.json'),
      children: children.map((value: RenderData) => toSnapshot(value)),
    },
    {
      plugins: [plugins.ReactTestComponent],
      printFunctionName: true,
    },
  );
}

export default toSnapshot;
