import { ImgHTMLAttributes } from 'react';
import { useTheme } from '@/common/theme/theme-provider';

type ThemeLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  large?: boolean;
};

export function ThemeLogo({ large = false, alt = 'JAECOO', className = '', ...props }: ThemeLogoProps) {
  const { theme } = useTheme();
  const src =
    theme === 'light'
      ? large
        ? '/assets/logo-jaecoo-black-large.png'
        : '/assets/logo-jaecoo-black.png'
      : '/assets/logo-jaecoo-white.png';

  return <img src={src} alt={alt} className={className} {...props} />;
}
