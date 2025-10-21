import React, { memo } from 'react';
import Button from './Button';
import type { ButtonProps } from './Button';

interface MemoizedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const MemoizedButton: React.FC<MemoizedButtonProps> = memo(({ children, ...props }) => {
  return <Button {...props}>{children}</Button>;
});

MemoizedButton.displayName = 'MemoizedButton';

export default MemoizedButton;
