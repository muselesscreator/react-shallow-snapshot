/* v8 ignore start */
/**
 * Mock a single function so that its name shows up in snapshots.
 * @param {fn} fn - target function
 * @param {string} name - render name.
 */
export const setMockName = (
  fn: () => unknown,
  name: string,
) => {
  Object.defineProperty(fn, 'name', { value: name });
};

export default setMockName;
