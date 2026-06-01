import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { uploadResume } from '../services/candidateService';
import { getJobs } from '../services/jobService';
import toast from 'react-hot-toast';

type Job = { _id: string; title: string };

export default function UploadResume() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getJobs().then(data => setJobs(data.jobs)).catch(() => {});
  }, []);

  const handleFile = (selected: File) => {
    if (selected.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async () => {
    if (!name || !email) { toast.error('Name and email are required'); return; }
    if (!file) { toast.error('Please select a PDF resume'); return; }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('jobId', jobId);
    formData.append('resume', file);

    setLoading(true);
    try {
      await uploadResume(formData);
      toast.success('Resume uploaded successfully!');
      navigate('/candidates');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Upload Resume">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Upload Candidate Resume</h2>
          <p className="text-gray-400 text-sm mt-1">PDF files only, max 5MB</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col gap-5">

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Candidate name"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Phone + Job */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
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

          {/* Drag and Drop Zone */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Resume PDF *</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              {file ? (
                <div>
                  <p className="text-2xl mb-2">📄</p>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-primary text-xs mt-2">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">📂</p>
                  <p className="text-white font-medium">Drag & drop PDF here</p>
                  <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                  <p className="text-gray-500 text-xs mt-2">PDF only • Max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/candidates')} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}