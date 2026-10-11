import type { Space } from '../data/catalog';

type Props = {
  space: Space;
  /** Largura em que a foto aparece, para o navegador escolher entre 640 e 1200 px. */
  sizes: string;
  className?: string;
  /** Foto principal da tela: carrega logo, sem esperar a rolagem. */
  priority?: boolean;
  /** Mostra "Foto ilustrativa" e o crédito do Unsplash embaixo da imagem. */
  caption?: boolean;
};

/** Foto do espaço com texto alternativo descritivo (WCAG 1.1.1). As fotos são ilustrativas:
 *  a legenda diz isso para ninguém esperar exatamente o ambiente da imagem. */
export function SpacePhoto({ space, sizes, className, priority = false, caption = false }: Props) {
  const base = `/spaces/${space.id}`;
  const img = (
    <img
      src={`${base}-640.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-1200.webp 1200w`}
      sizes={sizes}
      width={1200}
      height={800}
      alt={space.photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
  if (!caption) return <div className={`space-photo ${className ?? ''}`.trim()}>{img}</div>;
  return (
    <figure className={`space-photo ${className ?? ''}`.trim()}>
      {img}
      <figcaption>Foto ilustrativa · {space.photo.credit}, Unsplash</figcaption>
    </figure>
  );
}
