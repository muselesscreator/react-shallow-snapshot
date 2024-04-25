import { isEqual } from 'lodash';
import { ReactShallowRenderer } from './shallow';
import toSnapshot from './toSnapshot';
import * as types from './types';


class ElementExplorer {
  /** The rendered element data, which is the string content in the case of a base element */
  el: types.RenderOutput;
  /** The props object of the rendered element */
  props: Record<string, unknown>;
  /** The type of the rendered element */
  type: string | null;
  /** The child elements of the rendered element */
  children: ElementExplorer[];
  /** the parent element of the rendered element*/
  parent: ElementExplorer | null;

  /** @internal */
  constructor(
    element: types.RenderOutput,
    parent: ElementExplorer | null = null
  ) {
    this.el = element;
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
          new ElementExplorer(child, this)
        );
        this.children = (element.children as types.RenderOutput[])
          .map((value: types.RenderOutput) => mapChildren(value));
      }
    }
  }

  /**
   * Find an element by its data-testid attribute
   * @returns An array of ElementExplorer instances that match the testId
   * @example
   * ```ts
   * const el = shallow(
   *   <div data-testid="parent"><div data-testid="child"></div></div>
   * );
   * const explorer = el.instance;
   * const childElements = explorer.findByTestId("child");
   * ```
   */
  findByTestId(
     /* The data-testid attribute value to search for */
    testId: string
  ): ElementExplorer[] {
    const elements = [] as ElementExplorer[];
    const findChildrenByTestId = (el: ElementExplorer) => {
      if (Array.isArray(el)) {
        el.forEach((child) => {
          findChildrenByTestId(child);
        });
      }
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

  /**
   * Find an element by its type
   * @returns An array of ElementExplorer instances that match the type
   * @example
   * ```ts
   * const el = shallow(
   *    <div><button>Test Button</button></div>
   *  );
   *  const explorer = el.instance;
   *  const buttons = explorer.findByType('button');
   * ```
   */
  findByType(type: string | { name: string }): ElementExplorer[] {
    const typeString = typeof type === 'string' ? type : type.name;
    const elements = [] as ElementExplorer[];
    const findChildrenByType = (el: ElementExplorer) => {
      if (Array.isArray(el)) {
        el.forEach((child) => {
          findChildrenByTestId(child);
        });
      }
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

  /**
   * Find an element by its className
   * @returns An array of ElementExplorer instances that match the className
   * @example
   * ```ts
   * const el = shallow(
   *   <div><button className="test-button">Test Button</button></div>
   * );
   * const explorer = el.instance;
   * const buttons = explorer.findByClassName('test-button');
   * ```
   */
  findByClassName(className: string): ElementExplorer[] {
    const elements = [] as ElementExplorer[];
    const findChildrenByClassName = (el: ElementExplorer) => {
      if (Array.isArray(el)) {
        el.forEach((child) => {
          findChildrenByTestId(child);
        });
      }
      if (el.props.className === className) {
        elements.push(el);
      }
      el.children.forEach(child => {
        findChildrenByClassName(child);
      });
    };
    findChildrenByClassName(this);
    return elements;
  }

  /** @internal */
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

  /** @internal */
  get rawData(): types.RawRenderData {
    const data = this.data as types.ExplorerData;
    const { props, children } = data;
    const type = data.type as string;
    const loadedChildren = children.length > 1 ? children : children[0];
    return { props: { ...props, children: loadedChildren }, type };
  }

  /**
   * Check if the element matches the provided element
   * @param el The element to compare
   * @returns A boolean indicating if the element matches the provided element
   * @example
   * ```ts
   * const el = shallow(
   *   <div><button>Test Button</button></div>
   * );
   * const explorer = el.instance;
   * const button = explorer.findByType('button')[0];
   * const matches = button.matches(shallow(<button>Test Button</button>));
   * expect(matches).toBe(true);
   * ```
   */
  matches(el: ElementExplorer | ReactShallowRenderer) {
    if ("data" in el) {
      const elData = el.data;
      return isEqual(this.data, elData);
    }
    if ("instance" in el) {
      return isEqual(this.data, el.instance.data);
    }
    return isEqual(this.rawData, el);
  }

  get snapshot(): string {
    return toSnapshot(this.el);
  }
}

export default ElementExplorer;
