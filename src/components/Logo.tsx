import { Link } from 'react-router-dom';
import { Mark } from './Mark';

type Props = { to?: string; label?: string; asLink?: boolean };

export function Logo({ to = '/', label = 'Hubbi, início', asLink = true }: Props) {
  const content = (
    <>
      <Mark />
      <span>Hubbi</span>
    </>
  );
  if (!asLink) return <span className="logo">{content}</span>;
  return (
    <Link className="logo" to={to} aria-label={label}>
      {content}
    </Link>
  );
}
