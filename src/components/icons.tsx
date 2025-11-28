import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="https://res.cloudinary.com/dslsrhlsh/image/upload/v1759618011/ChitraGUPT.png-removebg-preview_k43a5j.png"
      alt="ChitraGupt Logo"
      width={100}
      height={100}
      {...props}
    />
  );
}
