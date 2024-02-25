import React from 'react';

import { useIntl } from 'react-intl';

import ImportedComponent from './ImportedComponent';
import messages from './messages';
import useExampleComponentData from './hooks';

export const ExampleComponent = () => {
  const {
    handleClickImportedComponent,
  } = useExampleComponentData();
  const { formatMessage } = useIntl();

  return (
    <div>
      <ImportedComponent
        className="imported-component"
        label={messages.importedComponentLabel}
        onClick={handleClickImportedComponent}
      />
      <div>
        <h1>{formatMessage(messages.heading)}</h1>
        <span>{formatMessage(messages.span)}</span>
      </div>
    </div>
  );
};
ExampleComponent.propTypes = {};

export const StringComponent = () => 'HelloThere';

export const NullComponent = () => null;
export const FalseComponent = () => false;
export const SimpleComponent = () => <div><h1>head</h1><p>SimpleComponent<b>Bold content</b></p></div>;

export default ExampleComponent;
