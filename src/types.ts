import { ReactTestRendererJSON } from 'react-test-renderer';

export type GenericTarget = string | null | boolean;

export type RenderData = ReactTestRendererJSON & {
  type: string,
  props: Record<string, unknown>,
  key?: string,
  ['$$typeof']?: symbol,
};
export type Node = React.ReactElement | RenderData | string;

export type toSnapshotFunction = (d: RenderOutput) => string;

/**
 * The types of elements that can be shallow rendered.
 * - `GenericTarget` is a string, null, or boolean.
 *   - `null` is a placeholder for a component that doesn't render anything.
 *   - `boolean` is a placeholder for a component that renders a boolean.
 *   - `string` is a placeholder for a component that renders a string.
 *   - `number` is a placeholder for a component that renders a number.
 *   - `undefined` is a placeholder for a component that renders undefined.
 *   - `null` is a placeholder for a component that renders null.
 *   - `true` is a placeholder for a component that renders true.
 *   - `false` is a placeholder for a component that renders false.
 *  - `React.ReactElement` is a placeholder for a component that renders a React element.
 *  - `ShallowTarget[]` is a placeholder for a component that renders an array of shallow targets.
 */
export type ShallowTarget = GenericTarget | React.ReactElement | ShallowTarget[];

/**
 * The types of elements that can be returned from the react test renderer.
 * - `GenericTarget` is a string, null, or boolean.
 *   - `null` is a placeholder for a component that doesn't render anything.
 *   - `boolean` is a placeholder for a component that renders a boolean.
 *   - `string` is a placeholder for a component that renders a string.
 *   - `number` is a placeholder for a component that renders a number.
 *   - `undefined` is a placeholder for a component that renders undefined.
 *   - `null` is a placeholder for a component that renders null.
 *   - `true` is a placeholder for a component that renders true.
 *   - `false` is a placeholder for a component that renders false.
 * - `React.ReactElement` is a placeholder for a component that renders a React element.
 * - `ShallowTarget[]` is a placeholder for a component that renders an array of shallow targets.
 * @typedef RenderOutput
 */
export type RenderOutput = GenericTarget | RenderData | RenderOutput[];
export type RawRenderData = { type: string, props: Record<string, unknown> };

export type ExplorerData = {
  el: RenderOutput,
  props: Record<string, unknown>,
  snapshot: string,
  toSnapshot: toSnapshotFunction,
  type: string | null,
  children: ExplorerData[],
  parent: ExplorerData | null,
  matches: (el: ExplorerData | JSX.Element) => boolean,
};
