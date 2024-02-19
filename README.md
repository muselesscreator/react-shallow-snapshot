# react-shallow-snapshot

React shallow snapshot renderer (in the style of Enzyme), that allows inspection and snapshots for react components in React 18+.
This library also provides a number of small utilities to help mock react components effectively.

## Utilities

### `shallow` - Shallow Renderer
Provides a shallow render of a given react component.  
#### Usage
import renderer
```js
import { shallow } from '@muselesscreator/react-shallow-snapshot';
```
Mock local components for shallow rendering
```js
jest.mock('./LocalComponent', () => 'LocalComponent');
```
Mock used component libraries (such as paragon) using provide `mockComponents` utility (see below).

Generate render element
```js
const el = shallow(<MyComponent {...props} />);
```
Validate snapshots
```js
expect(el.snapshot).toMatchSnapshot();
expect(el.instance.findByType(LocalComponent)[0].snapshot).toMatchSnapshot();
```
Inspect rendered component props and children.
```js
const localChild = el.instance.findByType(LocalComponent)[0];
const localDiv = el.instance.findByType('div')[0];
const localTestEl = el.instance.findByType('my-test-id')[0];
// returned object is of the shape { props, type, children }
expect(localChild.props.label).toEqual(myLabel);
expect(localDiv.children[0].type).toEqual('h1');
expect(localDiv.children[0].matches(<h1>My Header</h1>)).toEqual(true);
```

### `mockComponents` - Component library mocking utility
Component library mocking utility intended for imported libraries of many complex components to be mocked.

#### Usage
```js
jest.mock('@edx/paragon', () => jest.requireActual('@muselesscreator/react-shallow-snapshot').mockComponents({
  Button: 'Button',
  Icon: 'Icon',
  Form: {
    Group: 'Form.Group',
    Control: 'Form.Control',
  },
}));

// Provides mocks for <Button>, <Icon>, <Form>, <Form.Group>, and <Form.Control> with appropriate mocks to appear legibly in the snapshot.
```
