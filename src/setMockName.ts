/* v8 ignore start */
/**
 * Mock a single function so that its name shows up in snapshots.
 */
export const setMockName = (
  /* target function */
  fn: () => unknown,
  /* render name. */
  name: string,
) => {
  Object.defineProperty(fn, 'name', { value: name });
};

export default setMockName;
