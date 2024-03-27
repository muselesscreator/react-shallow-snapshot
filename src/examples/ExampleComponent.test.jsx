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
import setMockName from '../setMockName';
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
      handleClickImportedComponent: vi.fn(),
    };
    setMockName(hookProps.handleClickImportedComponent, 'hooks.handleClickImportedComponent');
    useExampleComponentData.mockReturnValue(hookProps);
    el = shallow(<ExampleComponent />);
  });
  describe.skip('behavior', () => {
    it('initializes hooks', () => {
      expect(useExampleComponentData).toHaveBeenCalledWith();
      expect(useIntl).toHaveBeenCalledWith();
    });
  });
  describe('render', () => {
    test('snapshot', () => {
      expect(el.snapshot).toMatchSnapshot();
    });

    describe.skip('output', () => {
      test('imported component', () => {
        const control = el.instance.findByType(ImportedComponent)[0];
        expect(control.props.onClick).toEqual(hookProps.handleClickImportedComponent);
      });
      test('findByClassName', () => {
        const control = el.instance.findByClassName('imported-component')[0];
        expect(control.matches(el.instance.findByType(ImportedComponent)[0])).toEqual(true);
      });
      test('random', () => {
        const control = el.instance.findByType('div')[1];
        const expected = shallow(
          <div>
            <h1>{formatMessage(messages.heading)}</h1>
            <span>{formatMessage(messages.span)}</span>
          </div>,
        ).instance;
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
