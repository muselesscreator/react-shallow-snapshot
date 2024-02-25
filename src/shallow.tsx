/* v8 ignore start */
import prettyFormat, { plugins } from 'pretty-format';
import React from 'react';
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
  Wrapper,
  Renderer,
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

class ReactShallowRenderer {
  shallowRenderer: Renderer = null;
  shallowWrapper: ReactTestRendererJSON | ReactTestRendererJSON[] | null = null;
  toSnapshot: toSnapshotFunction = ReactShallowRenderer.toSnapshot;

  constructor(
    children: types.ShallowTarget,
    options = {} as { Wrapper?: Wrapper },
  ) {
    const Wrapper = ("Wrapper" in options ? options.Wrapper : null) as Wrapper | null;
    const render = (content: React.ReactElement) => ReactTestRenderer.create(content).toJSON();
    if (Wrapper === null) {
      this.shallowWrapper = render(children as JSX.Element);
    } else {
      this.shallowWrapper = render(<Wrapper>{children as JSX.Element}</Wrapper>);
    }
  }

  static shallow(Component: types.ShallowTarget) {
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

  get snapshot() {
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

  get instance(): types.ExplorerData {
    const output = this.getRenderOutput();
    return new ElementExplorer(output, ReactShallowRenderer.toSnapshot);
  }

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

  getRenderOutput(render = false): RenderOutput {
    if (this.shallowWrapper === null) {
      return null;
    }
    return this.transformNode(this.shallowWrapper, render);
  }

  extractProps(
    props: Record<string, unknown>  = {},
    render: boolean,
    key?: string,
  ): Record<string, unknown>{
    const { children, ...passedProps } = props;
    const childrenArray = Array.isArray(children) ? children : [children];
    return {
      children: childrenArray.filter(Boolean).flatMap(
        (node) => this.transformNode(node, render),
      ),
      props: {
        ...passedProps,
        ...(key ? { key } : {}),
      },
    };
  }

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
    const { key } = node;
    const out = {
      type: this.extractType(node),
      props: { ...node.props, ...(key ? { key } : {}) },
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

  static toSnapshot(data: RenderOutput): object | string | object[] {
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
