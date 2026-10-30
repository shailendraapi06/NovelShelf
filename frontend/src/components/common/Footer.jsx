import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

export default function Footer() {
  const { showToast } = useLibrary();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      showToast(`Subscribed ${email} to The Literary Dispatch!`, 'success');
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-primary-container text-on-primary-container mt-space-2xl">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-primary-fixed-dim/20">
          
          {/* Brand Dossier */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img 
                alt="NovelShelf Logo" 
                className="h-8 w-auto object-contain brightness-200 contrast-125" 
                src="https://lh3.googleusercontent.com/aida/AEtjO1XSG8w1QlhIUBtGm-XjL-3wwSnRShu5-y4H1Obl4qB0Ie4R2DNAiuGGCLWepWTxsGcRrQXxeQmjG4cgpMmCNVjkfrtzmI2n-Ktx-RKQZE4tpdEEYn1mIwChldm_pCVOv8zqgiGjlik4wyjDYPNTWaEQFH5N4vY1ysfLjLWycmoqgI4nWmTntpRr-5QDIO2oBDd2YBGKUITcuzEjk6E184CpBexmm0nA5eXUwbcB6Ks"
              />
              <span className="font-title-editorial text-headline-sm text-surface font-semibold tracking-tight">
                NovelShelf
              </span>
            </Link>
            <p className="font-body-md text-body-md text-on-primary-container/90 max-w-sm">
              A curated digital sanctuary uniting bibliophiles, scholars, and custodians of rare texts. Immersive deep reading, rare illuminated folios, and public domain preservation.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#archive" 
                onClick={(e) => { e.preventDefault(); showToast("Browsing global library archival nodes."); }}
                className="w-9 h-9 rounded flex items-center justify-center bg-surface/10 text-surface hover:bg-surface/20 transition-colors" 
                title="Archival Society"
              >
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a 
                href="#rare" 
                onClick={(e) => { e.preventDefault(); showToast("Cataloging historical illuminated manuscripts."); }}
                className="w-9 h-9 rounded flex items-center justify-center bg-surface/10 text-surface hover:bg-surface/20 transition-colors" 
                title="Rare Folios"
              >
                <span className="material-symbols-outlined text-lg">import_contacts</span>
              </a>
              <a 
                href="#forum" 
                onClick={(e) => { e.preventDefault(); showToast("Opening digital marginalia and scholar reflections."); }}
                className="w-9 h-9 rounded flex items-center justify-center bg-surface/10 text-surface hover:bg-surface/20 transition-colors" 
                title="Scholar Reflections"
              >
                <span className="material-symbols-outlined text-lg">forum</span>
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="font-title-editorial text-title-editorial text-surface">
              Collections
            </span>
            <nav className="flex flex-col gap-2.5 font-body-sm text-body-sm">
              <Link to="/explore" className="text-on-primary-container hover:text-surface transition-colors">
                Explore Catalog
              </Link>
              <Link to="/reader/shadow-of-the-wind" className="text-on-primary-container hover:text-surface transition-colors">
                Reading Room
              </Link>
              <Link to="/explore?era=rare" className="text-on-primary-container hover:text-surface transition-colors">
                Illuminated Folios
              </Link>
              <Link to="/my-library" className="text-on-primary-container hover:text-surface transition-colors">
                Archival Bookmarks
              </Link>
            </nav>
          </div>

          {/* Digital Preservation Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="font-title-editorial text-title-editorial text-surface">
              Preservation
            </span>
            <nav className="flex flex-col gap-2.5 font-body-sm text-body-sm">
              <Link to="/contribute" className="text-on-primary-container hover:text-surface transition-colors">
                Digital Archiving
              </Link>
              <Link to="/contribute" className="text-on-primary-container hover:text-surface transition-colors">
                Transcription Charter
              </Link>
              <Link to="/explore" className="text-on-primary-container hover:text-surface transition-colors">
                Open Access Folios
              </Link>
              <Link to="/contribute" className="text-on-primary-container hover:text-surface transition-colors">
                Curator Guidelines
              </Link>
            </nav>
          </div>

          {/* The Literary Dispatch Newsletter */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="font-title-editorial text-title-editorial text-surface">
              The Literary Dispatch
            </span>
            <p className="font-body-sm text-body-sm text-on-primary-container/90">
              Subscribe to weekly literary quarterly reflections, newly restored public domain folios, and curator essays.
            </p>
            {isSubscribed ? (
              <div className="p-3 rounded bg-surface/10 border border-secondary text-secondary font-label-md text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>You are registered to receive The Literary Dispatch!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
                <input 
                  type="email" 
                  required
                  placeholder="curator@library.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded bg-surface/10 border border-primary-fixed-dim/30 text-surface placeholder:text-on-primary-container/70 text-body-sm font-body-sm focus:outline-none focus:ring-1 focus:ring-secondary-fixed"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-secondary text-surface font-label-md text-label-md rounded hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors shrink-0 font-semibold"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-primary-container/70 text-center sm:text-left">
          <p>© 2026 NovelShelf Digital Sanctuary. All public domain restorations and archival texts preserved.</p>
          <div className="flex items-center justify-center gap-6">
            <Link to="/explore" className="hover:text-surface transition-colors">Digital Charter</Link>
            <Link to="/contribute" className="hover:text-surface transition-colors">Provenance Code</Link>
            <Link to="/explore" className="hover:text-surface transition-colors">Catalog Index</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
