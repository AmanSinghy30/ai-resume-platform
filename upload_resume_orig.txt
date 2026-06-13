import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { uploadResume, parseResume } from '../services/candidateService';
import { getJobs } from '../services/jobService';
import toast from 'react-hot-toast';
import { useFormValidation } from '../hooks/useFormValidation';
import FormError from '../components/FormError';

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

    // Parse each file in parallel (but cap concurrency to 3 to avoid spam)
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

  const statusIcon = (status: BulkFile['status']) => {
    switch (status) {
      case 'pending': return '⏸️';
      case 'parsing': return '⏳';
      case 'parsed': return '📝';
      case 'uploading': return '⬆️';
      case 'done': return '✅';
      case 'error': return '❌';
    }
  };

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <Layout title="Upload Resume">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Candidate Resume</h2>
            <p className="text-gray-400 text-sm mt-1">PDF files only, max 5MB each</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-1.5 text-sm rounded-md transition ${
                mode === 'single' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-1.5 text-sm rounded-md transition ${
                mode === 'bulk' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Bulk
            </button>
          </div>
        </div>

        {/* ─── SINGLE MODE ─── */}
        {mode === 'single' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col gap-5">

            {/* Drag Drop FIRST so user drops file → form auto-fills */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Resume PDF *</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleSingleFile(e.target.files[0]); }}
                />
                {parsing ? (
                  <div>
                    <p className="text-3xl mb-2">⏳</p>
                    <p className="text-white">Parsing resume...</p>
                  </div>
                ) : file ? (
                  <div>
                    <p className="text-2xl mb-2">📄</p>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-primary text-xs mt-2">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-3">📂</p>
                    <p className="text-white font-medium">Drop PDF to auto-fill form</p>
                    <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-filled form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); clearError('name'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <FormError message={errors.name} />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <FormError message={errors.email} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                <input
                  value={phone}
                  onChange={e => { setPhone(e.target.value); clearError('phone'); }}
                  placeholder="Auto-filled from resume"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <FormError message={errors.phone} />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Job Position</label>
                <select
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select a job (optional)</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSingleSubmit}
                disabled={loading || parsing}
                className="flex-1"
              >
                {loading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </div>
          </div>
        )}

        {/* ─── BULK MODE ─── */}
        {mode === 'bulk' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col gap-5">

            {/* Job for all */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Job Position (applies to all)</label>
              <select
                value={bulkJobId}
                onChange={e => setBulkJobId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-400'
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
              <p className="text-4xl mb-3">📂</p>
              <p className="text-white font-medium">Drop multiple PDFs here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse • Up to 20 files</p>
            </div>

            {/* File List */}
            {bulkFiles.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                {bulkFiles.map((b, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{statusIcon(b.status)}</span>
                        <span className="text-gray-300 text-sm truncate">{b.file.name}</span>
                      </div>
                      <button
                        onClick={() => removeBulkFile(i)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                        disabled={bulkUploading}
                      >
                        ✕
                      </button>
                    </div>

                    {b.status === 'parsed' || b.status === 'uploading' || b.status === 'done' ? (
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          value={b.name || ''}
                          onChange={e => updateBulkField(i, 'name', e.target.value)}
                          placeholder="Name *"
                          disabled={bulkUploading || b.status === 'done'}
                          className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          value={b.email || ''}
                          onChange={e => updateBulkField(i, 'email', e.target.value)}
                          placeholder="Email *"
                          disabled={bulkUploading || b.status === 'done'}
                          className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          value={b.phone || ''}
                          onChange={e => updateBulkField(i, 'phone', e.target.value)}
                          placeholder="Phone"
                          disabled={bulkUploading || b.status === 'done'}
                          className="bg-gray-800 border border-gray-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : b.status === 'error' ? (
                      <p className="text-red-400 text-xs">{b.error}</p>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        {b.status === 'parsing' ? 'Parsing PDF...' : 'Waiting...'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleBulkSubmit}
                disabled={bulkUploading || bulkFiles.length === 0}
                className="flex-1"
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