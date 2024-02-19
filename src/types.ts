import React from 'react';
import { ReactTestRendererJSON } from 'react-test-renderer';

export type GenericTarget = string | null | boolean;

export type RenderData = ReactTestRendererJSON & {
  type: string,
  props: Record<string, unknown>,
  key?: string,
  ['$$typeof']?: symbol,
};
export type Node = React.ReactElement | RenderData | string;
export type Wrapper = (props: { children: JSX.Element }) => React.JSX.Element;
export type Renderer = (() => Wrapper) | null;
export type toSnapshotFunction = (d: RenderOutput) => string;

export type ShallowTarget = GenericTarget | React.ReactElement | ShallowTarget[];

export type ShallowChild = string | React.ReactElement;

export type RenderOutput = GenericTarget | RenderData | RenderOutput[];

export type ExplorerData = {
  el: RenderOutput,
  props: Record<string, unknown>,
  toSnapshot: toSnapshotFunction,
  type: string | null,
  children: ExplorerData[],
  parent: ExplorerData | null,
};
