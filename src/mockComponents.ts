/* v8 ignore start */
import setMockName from './setMockName';

/**
 * @typedef MockNestedComponent
 * Mock a single component, or a nested component so that its children render nicely
 * in snapshots.
 *   render name.
 * @return {func} - mock component with nested children.
 * usage:
 * ```js
 *  mockNestedComponent('Card', { Body: 'Card.Body', Form: { Control: { Feedback: 'Form.Control.Feedback' }}... });
 *  mockNestedComponent('IconButton', 'IconButton');
 *  ```
 */
export const mockNestedComponent = (
  /* parent component name */
  name: string,
  /* object of child components with intended component */
  contents: string | Record<string, unknown>,
): string | Record<string, unknown> => {
  if (typeof contents !== 'object') {
    return contents;
  }
  const fn = (() => name) as unknown as Record<string, unknown>;
  setMockName(fn as unknown as () => unknown, name);
  Object.keys(contents).forEach((nestedName) => {
    const value = contents[nestedName] as string | Record<string, unknown>;
    if (typeof value === 'object') {
      fn[nestedName] = mockNestedComponent(`${name}.${nestedName}`, value);
    } else {
      fn[nestedName] = value;
    }
  });
  return fn;
};

/**
 * Mock a module of components.  nested components will be rendered nicely in snapshots.
 * usage:
 * ```js
 *   mockNestedComponents({
 *     Card: { Body: 'Card.Body' },
 *     IconButton: 'IconButton',
 *   })
 *```
 * @return {obj} - module of flat and nested components that will render nicely in snapshots.
 */
export const mockNestedComponents = (
 /* component module mock config. */
  mapping: Record<string, string | Record<string, unknown>>
) => (
  Object.entries(mapping).reduce(
    (obj, [name, value]) => ({
      ...obj,
      [name]: mockNestedComponent(name, value),
    }),
    {},
  )
);

export default mockNestedComponents;
