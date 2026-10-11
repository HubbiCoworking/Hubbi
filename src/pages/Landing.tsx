import { Faq } from '../features/landing/Faq';
import { FinalCta } from '../features/landing/FinalCta';
import { Hero } from '../features/landing/Hero';
import { Plans } from '../features/landing/Plans';
import { PriceFacts } from '../features/landing/PriceFacts';
import { SiteFooter } from '../features/landing/SiteFooter';
import { Simulator } from '../features/landing/Simulator';
import { SpaceDetail } from '../features/landing/SpaceDetail';
import { Verde } from '../features/landing/Verde';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import '../styles/landing.css';
import { SkipLink } from '../components/SkipLink';

export default function Landing() {
  useDocumentTitle('Hubbi · Reserve seu espaço de trabalho');
  return (
    <div className="landing">
      <SkipLink />
      <main id="topo" className="zoom-area">
        <Hero />
        <PriceFacts />
        <SpaceDetail />
        <Simulator />
        <Plans />
        <Verde />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
