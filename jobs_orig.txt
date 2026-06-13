import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import { useFormValidation } from '../hooks/useFormValidation';
import FormError from '../components/FormError';
import { createJob, getJobs } from '../services/jobService';
import toast from 'react-hot-toast';

type Job = {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceRequired: number;
  candidateCount: number;
  createdAt: string;
};

export default function Jobs() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [jobs,       setJobs]       = useState<Job[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [view,       setView]       = useState<'grid' | 'list'>('grid');
  const [search,     setSearch]     = useState('');

  // Form fields
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [skills,      setSkills]      = useState('');
  const [experience,  setExperience]  = useState('');

  const { errors, validate, clearError } = useFormValidation({
    title:       { required: true },
    description: { required: true, minLength: 20 },
  });

  // ── Fetch Jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data.jobs);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ── Filtered Jobs (client-side search) ────────────────────────────────────
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.description.toLowerCase().includes(search.toLowerCase()) ||
    job.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Create Job ─────────────────────────────────────────────────────────────
  const handleCreateJob = async () => {
    const isValid = validate({ title, description });
    if (!isValid) return;

    setSubmitting(true);
    try {
      await createJob({
        title,
        description,
        requiredSkills: skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        experienceRequired: Number(experience) || 0,
      });
      toast.success('Job created!');
      setShowModal(false);
      resetForm();
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkills('');
    setExperience('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout title="Jobs">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Job Positions</h2>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'Loading...' : `${filteredJobs.length} active positions`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / List Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Job
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search jobs by title, skill..."
        />
      </div>

      {/* Active Search Tag */}
      {search && (
        <div className="flex gap-2 mb-4">
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
            Search: "{search}"
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-white ml-1"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty State — No Jobs At All */}
      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">💼</p>
          <h3 className="text-white font-semibold text-lg mb-2">
            No jobs posted yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Create your first job position to start receiving applications
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create First Job
          </Button>
        </div>
      )}

      {/* Empty State — Search No Results */}
      {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-white font-semibold text-lg mb-2">
            No jobs match "{search}"
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Try a different keyword
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-primary text-sm hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <Card
              key={job._id}
              className="hover:border-gray-500 transition-colors cursor-pointer"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                    💼
                  </div>
                  <h3 className="text-white font-semibold leading-tight">
                    {job.title}
                  </h3>
                </div>
                <Badge
                  label={`${job.candidateCount ?? 0} candidates`}
                  color="blue"
                />
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {job.requiredSkills.length > 0
                  ? job.requiredSkills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))
                  : (
                    <span className="text-xs text-gray-500">No skills listed</span>
                  )
                }
                {job.requiredSkills.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{job.requiredSkills.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  {job.experienceRequired}+ yrs exp •{' '}
                  {new Date(job.createdAt).toLocaleDateString('en-IN')}
                </p>
                <Button
                  variant="ghost"
                  className="text-xs py-1 px-3"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── List View ── */}
      {!loading && view === 'list' && filteredJobs.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredJobs.map(job => (
            <Card
              key={job._id}
              className="hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center justify-between">

                {/* Left — Icon + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                    💼
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{job.title}</h3>
                    <p className="text-gray-400 text-xs">
                      {job.experienceRequired}+ yrs exp •{' '}
                      {new Date(job.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Right — Skills + Count + Button */}
                <div className="flex items-center gap-4">
                  {/* Skills — hidden on mobile */}
                  <div className="hidden md:flex gap-1">
                    {job.requiredSkills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{job.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>

                  <Badge
                    label={`${job.candidateCount ?? 0} candidates`}
                    color="blue"
                  />

                  <Button
                    variant="ghost"
                    className="text-xs py-1 px-3"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Job Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">Create New Job</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Title */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Job Title *
                </label>
                <input
                  value={title}
                  onChange={e => { setTitle(e.target.value); clearError('title'); }}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. Frontend Developer"
                />
                <FormError message={errors.title} />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); clearError('description'); }}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-28 resize-none"
                  placeholder="Describe the role, responsibilities, requirements..."
                />
                <FormError message={errors.description} />
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Required Skills
                  <span className="text-gray-600 text-xs ml-1">(comma separated)</span>
                </label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. React, TypeScript, Node.js"
                />
                {/* Live skill preview */}
                {skills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span
                        key={s}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Experience Required (years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. 2"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateJob}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Job'}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}