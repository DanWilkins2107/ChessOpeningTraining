import type { ComponentProps } from 'react';
import './Button.css';

export function Button(props: Omit<ComponentProps<'button'>, 'className'>) {
  return <button className="button" {...props} />;
}
