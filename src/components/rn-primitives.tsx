import React from 'react';

/**
 * React Native + NativeWind Web Primitive Layer
 * Allows screens written with React Native components (<View>, <Text>, <ScrollView>,
 * <TouchableOpacity>, <Image>, <SafeAreaView>) and NativeWind `className` props
 * to execute identically in both Expo / React Native and the browser preview.
 */

export interface RNViewProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const View: React.FC<RNViewProps> = ({ className = '', children, ...rest }) => (
  <div className={className} {...rest}>
    {children}
  </div>
);

export const SafeAreaView: React.FC<RNViewProps> = ({ className = '', children, ...rest }) => (
  <div className={className} {...rest}>
    {children}
  </div>
);

export const ScrollView: React.FC<RNViewProps & { horizontal?: boolean }> = ({
  className = '',
  horizontal = false,
  children,
  ...rest
}) => (
  <div
    className={`${horizontal ? ' flex flex-row overflow-x-auto ' : ' overflow-y-auto '} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export interface RNTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  numberOfLines?: number;
  children?: React.ReactNode;
}

export const Text: React.FC<RNTextProps> = ({
  className = '',
  numberOfLines,
  children,
  ...rest
}) => (
  <span
    className={`${numberOfLines === 1 ? 'truncate block' : ''} ${className}`}
    {...rest}
  >
    {children}
  </span>
);

export interface RNTouchableOpacityProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onPress?: () => void;
  activeOpacity?: number;
  children?: React.ReactNode;
}

export const TouchableOpacity: React.FC<RNTouchableOpacityProps> = ({
  className = '',
  onPress,
  onClick,
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    onClick={onPress || onClick}
    className={`cursor-pointer select-none transition-opacity duration-150 active:opacity-80 focus-visible:outline-2 focus-visible:outline-amber-400 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export interface RNImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  source: { uri: string } | string;
  className?: string;
  alt?: string;
}

export const Image: React.FC<RNImageProps> = ({
  source,
  className = '',
  alt = 'Cricket Career Asset',
  ...rest
}) => {
  const srcUri = typeof source === 'string' ? source : source?.uri;
  return (
    <img
      src={srcUri}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      {...rest}
    />
  );
};
