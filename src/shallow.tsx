/* v8 ignore start */
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

  get snapshot(): RenderOutput {
    const output = this.getRenderOutput(true);
    return output;
  }

  get instance() {
    const output = this.getRenderOutput();
    return new ElementExplorer(output);
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
  /**
   * Transforms the ReactTestRenderer JSON into snapshot-friendly data by:
   *   - Flattening children arrays
   *   - Extracting props (including key) from React elements
   *     - Recursively transforming nested React elements
   *   - Extracting type from React elements
   *     - Handling special types (Fragment, Lazy, Suspense, etc.)
   *     - Handling ForwardRef and Memo components
   *   - Adding $$typeof symbol to output for Jest serialization
   */
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
    
    // Returns node as an array of one element if it is not an array
    const childrenArray = Array.isArray(node.children) ? node.children : [node.children];

    // Transforms react-type prop values into snapshot-friendly data
    const props = Object.keys(node.props).reduce((acc, key) => {
      const value = node.props[key] as RenderOutput;
      if (React.isValidElement(value)) {
        return {
          ...acc,
          [key]: this.transformNode(value, render)
        };
      }
      if (typeof value === 'function') {
        const mockValue = value as Mock;
        type Mock = { mockName: (name: string) => Mock, name: string };
        mockValue.mockName(mockValue.name);
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
}

export default ReactShallowRenderer.shallow;
