/* v8 ignore start */
import 'react';
declare global {
  // eslint-disable-next-line
  namespace JSX {
    interface IntrinsicElements {
      'format-message-function': {
        message: Record<string, unknown>;
        values: Record<string, unknown>;
      };
    }
  }
}

/**
 * Mocked formatMessage provided by react-intl
 */
export const formatMessage = (
  msg: Record<string, unknown>,
  values: Record<string, unknown>,
) => {
  let message = msg.defaultMessage as string;
  if (values === undefined) {
    return message;
  }
  // check if value is not a primitive type.
  if (Object.values(values).filter(value => Object(value) === value).length) {
    return <format-message-function {...{ message: msg, values }} />;
  }
  Object.keys(values).forEach((key) => {
    message = message.replaceAll(`{${key}}`, values[key] as string);
  });
  return message;
};

export default formatMessage;
