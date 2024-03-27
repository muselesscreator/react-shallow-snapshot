/* v8 ignore start */
import prettyFormat, { plugins } from 'pretty-format';
import * as React from 'react';
import ReactTestRenderer, {
 ReactTestRendererJSON,
} from 'react-test-renderer';
import {
  isFragment,
  isLazy,
  isPortal,
  isMemo,
  isSuspense,
  isForwardRef,
} from 'react-is';
import * as types from './types';
import {
  RenderData,
  Node,
  RenderOutput,
  toSnapshotFunction,
} from './types';
import ElementExplorer from './ElementExplorer';

const getNodeName = (node: Node): string => {
  if (!node || typeof node === 'string') { return ''; }
  if ("displayName" in node) {
    return node.displayName as string;
  } else if ("name" in node) {
    return node.name as string;
  }
  return '';
};

export class ReactShallowRenderer {
  /** @internal */
  shallowWrapper: ReactTestRendererJSON | ReactTestRendererJSON[] | null = null;
  /** @internal */
  toSnapshot: toSnapshotFunction = ReactShallowRenderer.toSnapshot;

  constructor(children: types.ShallowTarget) {
    const render = (content: React.ReactElement) => ReactTestRenderer.create(content).toJSON();
    this.shallowWrapper = render(children as JSX.Element);
  }

  static shallow(
    /** Target JSX to render */
    Component: types.ShallowTarget,
  ) {
    let out;
    try {
      out = new ReactShallowRenderer(Component);
    } catch (error) {
      console.log({ error });
      if (error instanceof Error) {
        if (!error.message.includes('ReactShallowRenderer')) {
          console.log({ error, out });
        }
      }
      out = Component;
    }
    return out;
  }

  isEmptyRender() {
    const data = this.getRenderOutput();
    return data === null || data === false;
  }

  get snapshot(): string {
    const output = this.getRenderOutput(true);
    const formatted = prettyFormat(
      output,
      {
        plugins: [plugins.ReactTestComponent],
        // printFunctionName: false,
      },
    );
    return formatted;
  }

  get instance() {
    const output = this.getRenderOutput();
    return new ElementExplorer(output, ReactShallowRenderer.toSnapshot);
  }

  /** @internal */
  extractType(node: Node): string {
    if (isLazy(node)) { return 'Lazy'; }

    if (isSuspense(node)) { return 'Suspense'; }

    if (isPortal(node)) { return 'Portal'; }

    if (isFragment(node)) { return 'Fragment'; }

    if (isForwardRef(node)) {
      const type = node.type as unknown as { displayName: string, render: Node };
      const functionName = getNodeName(type.render);
      if (typeof node === 'string') {
        return 'ForwardRef';
      }
      return type.displayName || (functionName !== '' ? `ForwardRef(${functionName})` : 'ForwardRef');
    }

    let name = getNodeName(node);
    if (!name && typeof node !== 'string') {
      name = node.type ? node.type : 'Component';
    }

    if (isMemo(node)) { return `Memo(${name || this.extractType(node.type)})`; }

    return name;
  }

  /** @internal */
  getRenderOutput(render = false): RenderOutput {
    if (this.shallowWrapper === null) {
      return null;
    }
    return this.transformNode(this.shallowWrapper, render);
  }

  /** @internal */
  transformNode(
    node: RenderOutput | RenderOutput[],
    render: boolean,
  ): RenderOutput {
    if (Array.isArray(node)) {
      return node.map((n) => this.transformNode(n, render));
    }
    if (
      typeof node !== 'object'
      || typeof node === 'boolean'
      || node === null
    ) {
      return node;
    }
    const childrenArray = Array.isArray(node.children) ? node.children : [node.children];
    const props = Object.keys(node.props).reduce((acc, key) => {
      const value = node.props[key];
      if (React.isValidElement(value)) {
        const el = ReactShallowRenderer.shallow(value);
        if (el !== null) {
          return { ...acc, [key]: new ElementExplorer(
            (el as ReactShallowRenderer).getRenderOutput(),
            ReactShallowRenderer.toSnapshot
          ).snapshot };
        }
      }
      return { ...acc, [key]: value };
    }, {});
    const { key } = node;
    const out = {
      type: this.extractType(node),
      props: { ...props, ...(key ? { key } : {}) },
      children: childrenArray.filter(Boolean).flatMap(
        (node) => this.transformNode(node, render),
      ),
    } as RenderData;
    if (render) {
      // this symbol is used by Jest to prettify serialized React test objects:
      // https://github.com/facebook/jest/blob/e0b33b74b5afd738edc183858b5c34053cfc26dd/packages/pretty-format/src/plugins/ReactTestComponent.ts
      out['$$typeof'] = Symbol.for('react.test.json');
    }
    return out;
  }

  /** @internal */
  static toSnapshot(data: RenderOutput): string {
    if (typeof data === 'string' || typeof data === 'boolean' || data === null) {
      return `${data}`;
    }
    if (Array.isArray(data)) {
      return data.map((value: RenderOutput) => ReactShallowRenderer.toSnapshot(value)).join('');
    }
    const children = data.children as RenderData[];
    return prettyFormat(
      {
        ...data,
        $$typeof: Symbol.for('react.test.json'),
        children: children.map((value: RenderData) => ReactShallowRenderer.toSnapshot(value)),
      },
      {
        plugins: [plugins.ReactTestComponent],
        printFunctionName: false,
      },
    );
  }
}

export default ReactShallowRenderer.shallow;
