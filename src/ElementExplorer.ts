/* v8 ignore start */
import { isEqual } from 'lodash';
import * as types from './types';

class ElementExplorer {
  el: types.RenderOutput;
  toSnapshot: types.toSnapshotFunction;
  props: Record<string, unknown>;
  type: string | null;
  children: ElementExplorer[];
  parent: ElementExplorer | null;

  constructor(
    element: types.RenderOutput,
    toSnapshot: types.toSnapshotFunction,
    parent: ElementExplorer | null = null
  ) {
    this.el = element;
    this.toSnapshot = toSnapshot;
    this.props = {};
    this.type = null;
    this.children = [];
    this.parent = parent;

    if (
      element === null
      || typeof element === 'string'
      || typeof element === 'boolean'
    ) {
      return;
    }

    if (!Array.isArray(element)) {
      this.props = element.props;
      this.type = element.type;
      if ("children" in element) {
        const mapChildren = (child: types.RenderOutput) => (
          new ElementExplorer(child, toSnapshot, this)
        );
        this.children = (element.children as types.RenderOutput[])
          .map((value: types.RenderOutput) => mapChildren(value));
      }
    }
  }

  findByTestId(testId: string): types.ExplorerData[] {
    const elements = [] as types.ExplorerData[];
    const findChildrenByTestId = (el: types.ExplorerData) => {
      if (el.props['data-testid'] === testId) {
        elements.push(el);
      }
      el.children.forEach(child => {
        findChildrenByTestId(child);
      });
    };
    findChildrenByTestId(this);
    return elements;
  }

  findByType(type: string | { name: string }): types.ExplorerData[] {
    const typeString = typeof type === 'string' ? type : type.name;
    const elements = [] as types.ExplorerData[];
    const findChildrenByType = (el: types.ExplorerData) => {
      if (el.type === typeString) {
        elements.push(el);
      }
      el.children.forEach(child => {
        findChildrenByType(child);
      });
    };
    findChildrenByType(this);
    return elements;
  }

  get data(): types.RenderOutput | types.ExplorerData {
    if (this.type === null) {
      return this.el;
    }
    const out = {
      props: this.props,
      type: this.type,
      children: this.children.map(child => child.data),
    } as types.ExplorerData;
    return out;
  }

  matches(el: types.ExplorerData | JSX.Element) {
    return isEqual("data" in el ? el.data : el, this.data);
  }

  get snapshot(): string | object | object[] {
    return this.toSnapshot(this.el);
  }
}

export default ElementExplorer;
