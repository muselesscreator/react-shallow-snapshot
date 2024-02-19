import {
  vi,
  beforeAll,
  it,
  describe,
  test,
  expect,
} from 'vitest';
import React from 'react';
import { useIntl } from 'react-intl';

import { formatMessage, shallow } from '..';
import ImportedComponent from './ImportedComponent';
import useExampleComponentData from './hooks';
import ExampleComponent, {
  SimpleComponent,
  NullComponent,
  FalseComponent,
} from './ExampleComponent';
import messages from './messages';

vi.mock('react-intl', async () => {
  const { formatMessage } = await vi.importActual('..');
  return {
    useIntl: vi.fn().mockImplementation(() => ({ formatMessage })),
    defineMessages: m => m,
  };
});
vi.mock('./ImportedComponent', () => ({
  default: 'ImportedComponent',
}));
vi.mock('./hooks', () => ({ __esModule: true, default: vi.fn() }));

let el;
let hookProps;
describe('ExampleComponent component', () => {
  beforeAll(() => {
    hookProps = {
      fileInputRef: { current: null },
      gradeExportUrl: 'test-grade-export-url',
      handleClickImportGrades: vi.fn().mockName('hooks.handleClickImportGrades'),
      handleFileInputChange: vi.fn().mockName('hooks.handleFileInputChange'),
    };
    useExampleComponentData.mockReturnValue(hookProps);
    el = shallow(<ExampleComponent />);
  });
  describe('behavior', () => {
    it('initializes hooks', () => {
      expect(useExampleComponentData).toHaveBeenCalledWith();
      expect(useIntl).toHaveBeenCalledWith();
    });
  });
  describe('render', () => {
    test('snapshot', () => {
      expect(el.snapshot).toMatchSnapshot();
    });

    describe('output', () => {
      test('imported component', () => {
        const control = el.instance.findByType(ImportedComponent)[0];
        expect(control.props.onClick).toEqual(hookProps.handleClickImportedComponent);
      });
      test('random', () => {
        const control = el.instance.findByType('div')[1];
        const expected = shallow(
          <div>
            <h1>{formatMessage(messages.heading)}</h1>
            <span>{formatMessage(messages.span)}</span>
          </div>,
        ).shallowWrapper;
        expect(control.matches(expected)).toEqual(true);
      });
    });
  });
  test('SimpleComponent shapshot', () => {
    const el = shallow(<SimpleComponent />);
    expect(el.snapshot).toMatchSnapshot();
  });
  test('FalseComponent shapshot', () => {
    const el = shallow(<FalseComponent />);
    expect(el.snapshot).toMatchSnapshot();
  });
  test('NullComponent shapshot', () => {
    const el = shallow(<NullComponent />);
    expect(el.snapshot).toMatchSnapshot();
  });
  test('ArrayComponent shapshot', () => {
    const el = shallow([<NullComponent />, <div>Test Component</div>, <ImportedComponent />]);
    expect(el.snapshot).toMatchSnapshot();
  });
});
