import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { uploadResume, parseResume } from '../services/candidateService';
import { getJobs } from '../services/jobService';
import toast from 'react-hot-toast';
import { useFormValidation } from '../hooks/useFormValidation';
import FormError from '../components/FormError';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2, Files, User } from 'lucide-react';

type Job = { _id: string; title: string };
type Mode = 'single' | 'bulk';

type BulkFile = {
  file: File;
  status: 'pending' | 'parsing' | 'parsed' | 'uploading' | 'done' | 'error';
  name?: string;
  email?: string;
  phone?: string;
  tempFilePath?: string;
  error?: string;
};

export default function UploadResume() {
  const [mode, setMode] = useState<Mode>('single');

  // Single mode state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tempFilePath, setTempFilePath] = useState<string>('');
  const [parsing, setParsing] = useState(false);

  // Bulk mode state
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [bulkJobId, setBulkJobId] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);

  // Shared
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { errors, validate, clearError } = useFormValidation({
    name: { required: true, minLength: 2 },
    email: { required: true, isEmail: true },
    phone: { isPhone: true },
  });

  useEffect(() => {
    getJobs().then(data => setJobs(data.jobs)).catch(() => {});
  }, []);

  // ─── SINGLE MODE ────────────────────────────────────────
  const handleSingleFile = async (selected: File) => {
    if (selected.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setFile(selected);
    setParsing(true);

    const fd = new FormData();
    fd.append('resume', selected);

    try {
      const data = await parseResume(fd);
      const { extracted } = data;

      setName(extracted.name || '');
      setEmail(extracted.email || '');
      setPhone(extracted.phone || '');
      setTempFilePath(extracted.tempFilePath || '');

      toast.success('Resume parsed! Review and edit if needed.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not parse PDF');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleSingleFile(dropped);
  };

  const handleSingleSubmit = async () => {
    const isValid = validate({ name, email, phone });
    if (!isValid) { toast.error('Please fix the form errors'); return; }
    if (!file && !tempFilePath) { toast.error('Please select a PDF resume'); return; }

    const formData = new FormData();
    formData.append('name', name);
    //formData.append('resume',file);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('jobId', jobId);
    if (tempFilePath) {
      formData.append('tempFilePath', tempFilePath);
    } else if (file) {
      formData.append('resume', file);
    }

    setLoading(true);
    try {
      /*await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  body: formData
  // do NOT set Content-Type header — browser sets it automatically
});*/
      await uploadResume(formData);
      toast.success('Resume uploaded successfully!');
      navigate('/candidates');
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        serverErrors.forEach((e: any) => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── BULK MODE ──────────────────────────────────────────
  const handleBulkFiles = async (selected: FileList) => {
    const arr = Array.from(selected).filter(f => f.type === 'application/pdf' && f.size <= 5 * 1024 * 1024);
    if (arr.length === 0) {
      toast.error('No valid PDF files selected (max 5MB each)');
      return;
    }
    if (arr.length > 20) {
      toast.error('Maximum 20 files at once');
      return;
    }

    const initial: BulkFile[] = arr.map(f => ({ file: f, status: 'pending' }));
    setBulkFiles(initial);

    const concurrency = 3;
    for (let i = 0; i < arr.length; i += concurrency) {
      const batch = arr.slice(i, i + concurrency);
      await Promise.all(batch.map((f, j) => parseOneBulkFile(i + j, f)));
    }
  };

  const parseOneBulkFile = async (index: number, f: File) => {
    setBulkFiles(prev => prev.map((b, i) => i === index ? { ...b, status: 'parsing' } : b));

    const fd = new FormData();
    fd.append('resume', f);

    try {
      const data = await parseResume(fd);
      const { extracted } = data;

      setBulkFiles(prev => prev.map((b, i) => i === index ? {
        ...b,
        status: 'parsed',
        name: extracted.name || '',
        email: extracted.email || '',
        phone: extracted.phone || '',
        tempFilePath: extracted.tempFilePath || '',
      } : b));
    } catch (err: any) {
      setBulkFiles(prev => prev.map((b, i) => i === index ? {
        ...b,
        status: 'error',
        error: err.response?.data?.message || 'Parse failed',
      } : b));
    }
  };

  const updateBulkField = (index: number, field: 'name' | 'email' | 'phone', value: string) => {
    setBulkFiles(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    const validFiles = bulkFiles.filter(b => b.status === 'parsed' && b.name && b.email);
    if (validFiles.length === 0) {
      toast.error('No valid candidates to upload (need name + email)');
      return;
    }

    setBulkUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < bulkFiles.length; i++) {
      const b = bulkFiles[i];
      if (b.status !== 'parsed' || !b.name || !b.email) continue;

      setBulkFiles(prev => prev.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));

      const fd = new FormData();
      fd.append('name', b.name);
      fd.append('email', b.email);
      fd.append('phone', b.phone || '');
      fd.append('jobId', bulkJobId);
      fd.append('tempFilePath', b.tempFilePath || '');

      try {
        await uploadResume(fd);
        successCount++;
        setBulkFiles(prev => prev.map((x, idx) => idx === i ? { ...x, status: 'done' } : x));
      } catch (err: any) {
        failCount++;
        setBulkFiles(prev => prev.map((x, idx) => idx === i ? {
          ...x, status: 'error', error: err.response?.data?.message || 'Upload failed'
        } : x));
      }
    }

    setBulkUploading(false);
    toast.success(`Uploaded ${successCount} candidates${failCount ? `, ${failCount} failed` : ''}`);
    if (successCount > 0 && failCount === 0) {
      setTimeout(() => navigate('/candidates'), 1500);
    }
  };

  const StatusIcon = ({ status }: { status: BulkFile['status'] }) => {
    switch (status) {
      case 'pending': return <Loader2 size={16} className="text-slate-500 animate-spin" />;
      case 'parsing': return <Loader2 size={16} className="text-primary animate-spin" />;
      case 'parsed': return <FileText size={16} className="text-blue-400" />;
      case 'uploading': return <UploadCloud size={16} className="text-primary animate-bounce" />;
      case 'done': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <Layout title="Upload Resume">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Upload Candidates</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">PDF files only, max 5MB each</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 self-start sm:self-auto">
            <button
              onClick={() => setMode('single')}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                mode === 'single' ? 'gradient-primary text-white shadow-glow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User size={16} /> Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                mode === 'bulk' ? 'gradient-primary text-white shadow-glow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Files size={16} /> Bulk
            </button>
          </div>
        </div>

        {/* ─── SINGLE MODE ─── */}
        {mode === 'single' && (
          <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-glass-lg flex flex-col gap-6 animate-scale-in">

            {/* Drag Drop FIRST so user drops file → form auto-fills */}
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Resume PDF *</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  dragging ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleSingleFile(e.target.files[0]); }}
                />
                
                <div className="relative z-10 flex flex-col items-center">
                  {parsing ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 border border-indigo-500/20">
                        <Loader2 size={32} className="text-primary animate-spin" />
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium">Parsing resume...</p>
                      <p className="text-slate-600 dark:text-slate-500 text-sm mt-1">Extracting details using AI</p>
                    </>
                  ) : file ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-glow-green">
                        <FileText size={32} className="text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium">{file.name}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-primary text-xs mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud size={32} className="text-primary" />
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium text-lg">Drop PDF to auto-fill form</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">or click to browse from your computer</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-filled form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Full Name *</label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); clearError('name'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
                <FormError message={errors.name} />
              </div>

              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
                <FormError message={errors.email} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Phone</label>
                <input
                  value={phone}
                  onChange={e => { setPhone(e.target.value); clearError('phone'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
                <FormError message={errors.phone} />
              </div>

              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Job Position</label>
                <select
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="">Select a job (optional)</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex-1 py-3">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSingleSubmit}
                disabled={loading || parsing}
                className="flex-1 py-3 shadow-glow-md"
              >
                {loading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </div>
          </div>
        )}

        {/* ─── BULK MODE ─── */}
        {mode === 'bulk' && (
          <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-glass-lg flex flex-col gap-6 animate-scale-in">

            {/* Job for all */}
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">Job Position (applies to all)</label>
              <select
                value={bulkJobId}
                onChange={e => setBulkJobId(e.target.value)}
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="">No job assigned</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files) handleBulkFiles(e.dataTransfer.files);
              }}
              onClick={() => bulkInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group ${
                dragging ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <input
                ref={bulkInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) handleBulkFiles(e.target.files); }}
              />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Files size={32} className="text-primary" />
              </div>
              <p className="text-slate-900 dark:text-white font-medium text-lg">Drop multiple PDFs here</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">or click to browse • Up to 20 files</p>
            </div>

            {/* File List */}
            {bulkFiles.length > 0 && (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {bulkFiles.map((b, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl p-4 transition-all duration-200 hover:border-slate-300 dark:hover:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 flex-shrink-0">
                          <StatusIcon status={b.status} />
                        </div>
                        <span className="text-slate-800 dark:text-slate-300 text-sm font-medium truncate">{b.file.name}</span>
                      </div>
                      <button
                        onClick={() => removeBulkFile(i)}
                        className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                        disabled={bulkUploading}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {b.status === 'parsed' || b.status === 'uploading' || b.status === 'done' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          value={b.name || ''}
                          onChange={e => updateBulkField(i, 'name', e.target.value)}
                          placeholder="Name *"
                          disabled={bulkUploading || b.status === 'done'}
                          className="input-glass text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
                        />
                        <input
                          value={b.email || ''}
                          onChange={e => updateBulkField(i, 'email', e.target.value)}
                          placeholder="Email *"
                          disabled={bulkUploading || b.status === 'done'}
                          className="input-glass text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
                        />
                        <input
                          value={b.phone || ''}
                          onChange={e => updateBulkField(i, 'phone', e.target.value)}
                          placeholder="Phone"
                          disabled={bulkUploading || b.status === 'done'}
                          className="input-glass text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
                        />
                      </div>
                    ) : b.status === 'error' ? (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-2 mt-2">
                        <AlertCircle size={14} className="text-red-500 dark:text-red-400" />
                        <p className="text-red-500 dark:text-red-400 text-xs font-medium">{b.error}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <p className="text-slate-600 dark:text-slate-500 text-xs font-medium flex items-center gap-1.5">
                          {b.status === 'parsing' ? (
                            <><Loader2 size={12} className="animate-spin text-primary" /> Parsing PDF with AI...</>
                          ) : 'Waiting...'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-2">
              <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex-1 py-3">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkSubmit}
                disabled={bulkUploading || bulkFiles.length === 0}
                className="flex-1 py-3 shadow-glow-md"
              >
                {bulkUploading
                  ? 'Uploading...'
                  : `Upload ${bulkFiles.filter(b => b.status === 'parsed').length} Candidates`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}