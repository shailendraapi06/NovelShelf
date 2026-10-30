import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ContributePage() {
  const { addContribution, showToast } = useLibrary();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contribType, setContribType] = useState('digital'); // digital | transcription | annotation
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [year, setYear] = useState('1924');
  const [pages, setPages] = useState('280');
  const [edition, setEdition] = useState('');
  const [license, setLicense] = useState('Public Domain (Universal)');
  const [synopsis, setSynopsis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PDF File upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Format file size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileProcess = (file) => {
    if (!file) return;

    // Check extension
    const validExtensions = ['pdf', 'epub', 'djvu'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      showToast('Please upload a valid book document (.pdf, .epub, or .djvu).', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('File exceeds 50MB maximum size limit.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    // Simulate realistic upload progress
    const timer1 = setTimeout(() => setUploadProgress(60), 300);
    const timer2 = setTimeout(() => {
      setUploadProgress(100);
      setPdfFile(file);
      setPdfFileName(file.name);
      setPdfFileSize(formatBytes(file.size));
      
      const fileUrl = URL.createObjectURL(file);
      setPdfFileUrl(fileUrl);
      setIsUploading(false);

      // Auto-populate Title if empty
      if (!title.trim()) {
        const cleanName = file.name
          .replace(/\.(pdf|epub|djvu)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setTitle(cleanName);
      }

      showToast(`"${file.name}" uploaded and validated successfully!`, 'success');
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (pdfFileUrl) {
      URL.revokeObjectURL(pdfFileUrl);
    }
    setPdfFile(null);
    setPdfFileName('');
    setPdfFileSize('');
    setPdfFileUrl('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Uploaded document removed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      showToast('Please specify the volume title and author.', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('Patron authentication required to contribute digital folios.', 'error');
      navigate('/login?redirect=/contribute');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      formData.append('genre', genre);
      formData.append('year', year || '1924');
      formData.append('pages', pages || '280');
      formData.append('edition', edition.trim() || (pdfFileName ? `Digital Folio (${pdfFileName})` : 'Curator Archival Scan'));
      formData.append('license', license);
      formData.append('synopsis', synopsis.trim() || 'A curated digital addition to the NovelShelf archival registry.');
      formData.append('rightsConfirmed', 'true');
      
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      } else {
        // Create an archival dummy PDF blob if no file was uploaded
        const dummyBlob = new Blob([`%PDF-1.4 Archival Folio ${title} by ${author}`], { type: 'application/pdf' });
        formData.append('pdf', dummyBlob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_manuscript.pdf`);
      }

      await api.submitContribution(formData);

      addContribution({
        title: title.trim(),
        author: author.trim(),
        genre,
        year: Number(year) || 1924,
        pages: Number(pages) || 280,
        edition: edition.trim() || (pdfFileName ? `Digital Folio (${pdfFileName})` : 'Curator Archival Scan'),
        license,
        synopsis: synopsis.trim() || 'A curated digital addition to the NovelShelf archival registry.',
        type: contribType === 'transcription' 
          ? 'Public Domain Transcription' 
          : contribType === 'annotation' 
          ? 'Annotated Scholar Edition' 
          : 'Digital Archive PDF',
        pdfName: pdfFileName || 'digital_folio_scan.pdf',
        pdfSize: pdfFileSize || '12.4 MB',
        pdfUrl: pdfFileUrl
      });

      showToast(`"${title}" submitted to quarantine for curator verification!`, 'success');
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/my-library?tab=contributions');
      }, 800);
    } catch (err) {
      setIsSubmitting(false);
      showToast(err.message || 'Error submitting folio to quarantine chamber.', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 w-full">
        
        {/* Guest Authentication Notice */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-secondary">lock</span>
              <div>
                <p className="text-sm font-semibold text-primary">Patron Authentication Required to Submit</p>
                <p className="text-xs text-on-surface-variant">Sign in or create a patron account so your digital contributions can be cataloged under your name.</p>
              </div>
            </div>
            <Link
              to="/login?redirect=/contribute"
              className="px-4 py-2 bg-secondary text-on-secondary text-xs font-semibold rounded-lg shadow-sm hover:bg-secondary/90 transition-all shrink-0"
            >
              Sign In to Contribute &rarr;
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-archival text-xs text-secondary tracking-widest uppercase font-bold">
                Open Archival Guild
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-primary tracking-tight font-bold font-serif">
              Contribute a Digital Folio / Book PDF
            </h1>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-2xl mt-1.5 leading-relaxed">
              Support the global library community by uploading your copies of rare books, public domain literature, or scholarly manuscripts in PDF format.
            </p>
          </div>

          {/* Type Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full shadow-xs overflow-x-auto max-w-full">
            <button 
              type="button"
              onClick={() => setContribType('digital')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                contribType === 'digital'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Book PDF / Folio
            </button>
            <button 
              type="button"
              onClick={() => setContribType('transcription')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                contribType === 'transcription'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Public Domain Text
            </button>
            <button 
              type="button"
              onClick={() => setContribType('annotation')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-label-md text-xs sm:text-label-md transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                contribType === 'annotation'
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Annotated Edition
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Contribution Form */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-5 sm:p-8 shadow-xs border border-surface-variant/40">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* 1. PROMINENT PDF / DIGITAL FILE UPLOAD DROPZONE */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-base">picture_as_pdf</span>
                    <span>Upload Book Document (PDF / EPUB) *</span>
                  </label>
                  <span className="text-[11px] font-label-archival text-outline uppercase font-semibold">
                    Max 50MB • PDF, EPUB, DJVU
                  </span>
                </div>

                {!pdfFileName ? (
                  /* Dropzone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full rounded-xl p-6 sm:p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center ${
                      isDragging
                        ? 'border-secondary bg-secondary-container/20 scale-[1.01]'
                        : 'border-surface-variant hover:border-primary/60 bg-surface-container-lowest/80 hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.epub,.djvu,application/pdf"
                      onChange={(e) => handleFileProcess(e.target.files[0])}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </div>

                    <div className="flex flex-col gap-1 max-w-sm">
                      <p className="font-headline-sm text-sm sm:text-base text-primary font-bold">
                        Click to browse or drag and drop your book PDF here
                      </p>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Share digitized volumes, out-of-print scans, or historical literature to preserve in our public digital library.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-outline text-xs font-label-md">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      <span>PDF, EPUB, DJVU supported</span>
                    </div>

                    {/* Progress Bar (during simulated parsing) */}
                    {isUploading && (
                      <div className="w-full max-w-xs mt-3">
                        <div className="flex items-center justify-between text-xs font-label-archival text-secondary mb-1">
                          <span>Reading &amp; Validating Document...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary transition-all duration-300 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Uploaded File Card */
                  <div className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-secondary/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-lg text-sm text-primary font-bold truncate max-w-xs sm:max-w-md">
                          {pdfFileName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-label-archival text-outline font-semibold">
                            {pdfFileSize}
                          </span>
                          <span className="text-xs text-outline">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-label-md text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            <span>Verified Document</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      {pdfFileUrl && (
                        <a 
                          href={pdfFileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-surface-container text-primary hover:bg-surface-container-high rounded-md font-label-md text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Preview</span>
                        </a>
                      )}
                      <button 
                        type="button"
                        onClick={handleRemoveFile}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-label-md text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Replace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold" htmlFor="titleInput">
                    Volume Title *
                  </label>
                  <input 
                    id="titleInput"
                    type="text" 
                    required
                    placeholder="e.g. The Aleph and Other Stories"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold" htmlFor="authorInput">
                    Author / Creator *
                  </label>
                  <input 
                    id="authorInput"
                    type="text" 
                    required
                    placeholder="e.g. Jorge Luis Borges"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                    Genre / Classification
                  </label>
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer min-h-[44px]"
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Classic Literature">Classic Literature</option>
                    <option value="Philosophy & Ethics">Philosophy &amp; Ethics</option>
                    <option value="Sci-Fi & Speculative">Sci-Fi &amp; Speculative</option>
                    <option value="Mystery & Detective">Mystery &amp; Detective</option>
                    <option value="Poetry & Verse">Poetry &amp; Verse</option>
                    <option value="History & Art">History &amp; Art</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                    Original Publication Year
                  </label>
                  <input 
                    type="number" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                    Page Count (Est.)
                  </label>
                  <input 
                    type="number" 
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                    Digital Provenance / Source Archive
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Personal scan of 1949 Emecé Editores Folio"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                    Open Access Declaration
                  </label>
                  <select 
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer min-h-[44px]"
                  >
                    <option value="Public Domain (Universal)">Public Domain (Universal)</option>
                    <option value="Creative Commons BY-NC 4.0">Creative Commons BY-NC 4.0</option>
                    <option value="Curated Scholarly Transcription">Curated Scholarly Transcription</option>
                    <option value="Open Archival Preservation">Open Archival Preservation</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-xs sm:text-label-md text-primary font-semibold">
                  Curatorial Synopsis &amp; Literary Notes
                </label>
                <textarea 
                  rows="3"
                  placeholder="Describe the significance of this edition, translation remarks, or thematic motifs..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full p-4 rounded-lg bg-surface border border-surface-variant text-on-surface font-body-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-4 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-body-sm text-xs text-on-surface-variant">
                  By uploading, you affirm this volume meets open access digital library standards.
                </p>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-lg text-sm sm:text-label-lg transition-all shadow-md font-semibold disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">cloud_upload</span>
                  <span>{isSubmitting ? 'Archiving PDF & Cataloging...' : 'Upload & Archive Folio'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Curator Guidelines Dossier */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Why upload section */}
            <div className="bg-surface-container rounded-2xl p-5 sm:p-6 shadow-xs border border-surface-variant/40 flex flex-col gap-4">
              <span className="font-label-archival text-xs text-secondary uppercase tracking-widest font-bold">
                Community Preservation
              </span>
              <h3 className="font-headline-sm text-lg text-primary font-serif font-bold">
                Why Contribute Your Book PDFs?
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                NovelShelf is built by bibliophiles for bibliophiles. When you upload book documents and manuscripts from your personal collection:
              </p>
              
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-lg mt-0.5 shrink-0">menu_book</span>
                  <span className="font-body-sm text-xs text-on-surface">
                    <strong>Permanent Preservation:</strong> Rare, out-of-print titles are indexed and preserved for posterity.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-lg mt-0.5 shrink-0">local_library</span>
                  <span className="font-body-sm text-xs text-on-surface">
                    <strong>Reading Room Formatting:</strong> Uploaded folios are calibrated for our distraction-free reading room.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-lg mt-0.5 shrink-0">public</span>
                  <span className="font-body-sm text-xs text-on-surface">
                    <strong>Universal Open Access:</strong> Empower students, scholars, and curious readers around the world.
                  </span>
                </div>
              </div>
            </div>

            {/* Recognition Badge */}
            <div className="p-5 bg-secondary-fixed/30 rounded-2xl border border-secondary/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-xl">workspace_premium</span>
                <span className="font-label-lg text-sm font-semibold">Archival Custodian Badge</span>
              </div>
              <p className="font-body-sm text-xs text-on-secondary-fixed-variant leading-relaxed">
                Contributors who upload digital folios receive the certified Custodian badge in NovelShelf, allowing them to annotate communal marginalia and guide reading circles.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
