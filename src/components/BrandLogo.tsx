import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  imgClassName?: string;
  alt?: string;
};

export function BrandLogo({ className, imgClassName, alt = 'Walluxe' }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center shrink-0', className)}>
      <img
        src="/logo.png"
        alt={alt}
        decoding="async"
        className={cn('h-8 w-auto max-w-[200px] object-contain object-left', imgClassName)}
      />
    </span>
  );
}
