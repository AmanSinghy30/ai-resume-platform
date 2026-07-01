import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import { useFormValidation } from '../hooks/useFormValidation';
import FormError from '../components/FormError';
import Pagination from '../components/Pagination';
import { createJob, getJobs } from '../services/jobService';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Search,
  Plus,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState('');
  const [skillWeight, setSkillWeight] = useState(50);
  const [experienceWeight, setExperienceWeight] = useState(30);
  const [roleFitWeight, setRoleFitWeight] = useState(20);
  const [experience, setExperience] = useState('');

  const { errors, validate, clearError } = useFormValidation({
    title: { required: true },
    description: { required: true, minLength: 20 },
  });

  // ── Fetch Jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page: page.toString(),
        limit: '9',
        ...(search && { search })
      };
      const data = await getJobs(params);
      setJobs(data.jobs);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // ── Filtered Jobs (client-side search) ────────────────────────────────────
  // ── (Client-side search removed, now handled by server) ─────────────────
  const filteredJobs = jobs;

  // ── Create Job ─────────────────────────────────────────────────────────────
  const handleCreateJob = async () => {
    const isValid = validate({ title, description });
    if (!isValid) return;

    if (skillWeight + experienceWeight + roleFitWeight !== 100) {
      toast.error('AI Evaluation Weights must sum exactly to 100');
      return;
    }

    setSubmitting(true);
    try {
      await createJob({
        title,
        description,
        requiredSkills: skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        niceToHaveSkills: niceToHaveSkills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        skillWeight,
        experienceWeight,
        roleFitWeight,
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
    setNiceToHaveSkills('');
    setSkillWeight(50);
    setExperienceWeight(30);
    setRoleFitWeight(20);
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
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Job Positions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
            {loading ? 'Loading...' : `${totalCount} active positions`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / List Toggle */}
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 ${view === 'grid'
                  ? 'gradient-primary text-white shadow-glow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 ${view === 'list'
                  ? 'gradient-primary text-white shadow-glow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <List size={14} /> List
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={16} /> Create Job
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-fade-in">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search jobs by title, skill..."
        />
      </div>

      {/* Active Search Tag */}
      {search && (
        <div className="flex gap-2 mb-4 animate-fade-in">
          <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
            Search: "{search}"
            <button
              onClick={() => setSearch('')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty State — No Jobs At All */}
      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center mb-5 border border-violet-500/15">
            <Briefcase size={36} className="text-violet-500 dark:text-violet-400" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
            No jobs posted yet
          </h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-6">
            Create your first job position to start receiving applications
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={16} /> Create First Job
          </Button>
        </div>
      )}

      {/* Empty State — Search No Results */}
      {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center mb-5 border border-slate-200 dark:border-white/5">
            <Search size={36} className="text-slate-500" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
            No jobs match "{search}"
          </h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4">
            Try a different keyword
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-primary text-sm hover:text-primary-dark transition-colors font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {!loading && view === 'grid' && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filteredJobs.map(job => (
            <Card
              key={job._id}
              className="cursor-pointer"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center border border-violet-500/20 flex-shrink-0">
                    <Briefcase size={18} className="text-violet-500 dark:text-violet-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-semibold leading-tight">
                    {job.title}
                  </h3>
                </div>

              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.requiredSkills.length > 0
                  ? job.requiredSkills.slice(0, 4).map(skill => (
                    <span
                      key={skill}
                      className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5"
                    >
                      {skill}
                    </span>
                  ))
                  : (
                    <span className="text-xs text-slate-500 dark:text-slate-600">No skills listed</span>
                  )
                }
                {job.requiredSkills.length > 4 && (
                  <span className="text-xs text-slate-500">
                    +{job.requiredSkills.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs">
                  {job.experienceRequired}+ yrs exp •{' '}
                  {new Date(job.createdAt).toLocaleDateString('en-IN')}
                </p>
                <Button
                  variant="ghost"
                  className="text-xs py-1.5 px-3"
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
        <div className="flex flex-col gap-3 animate-fade-in">
          {filteredJobs.map(job => (
            <Card
              key={job._id}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">

                {/* Left — Icon + Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center border border-violet-500/20 flex-shrink-0">
                    <Briefcase size={18} className="text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-medium">{job.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                      {job.experienceRequired}+ yrs exp •{' '}
                      {new Date(job.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Right — Skills + Count + Button */}
                <div className="flex items-center gap-4">
                  {/* Skills — hidden on mobile */}
                  <div className="hidden md:flex gap-1.5">
                    {job.requiredSkills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-xs text-slate-500 mt-1">
                        +{job.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>


                  <Button
                    variant="ghost"
                    className="text-xs py-1.5 px-3"
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

      {/* ── Pagination ── */}
      {jobs.length > 0 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}


      {/* ── Create Job Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-sm dark:shadow-glass-lg animate-scale-in">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-tight">Create New Job</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Title */}
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                  Job Title *
                </label>
                <input
                  value={title}
                  onChange={e => { setTitle(e.target.value); clearError('title'); }}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="e.g. Frontend Developer"
                />
                <FormError message={errors.title} />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); clearError('description'); }}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm h-28 resize-none placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Describe the role, responsibilities, requirements..."
                />
                <FormError message={errors.description} />
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                  Must-Have Skills
                  <span className="text-slate-500 dark:text-slate-600 text-xs ml-1 font-normal">(comma separated)</span>
                </label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="e.g. React, TypeScript, Node.js"
                />
                {/* Live skill preview */}
                {skills && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span
                        key={s}
                        className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nice to Have Skills */}
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                  Good-to-Have Skills
                  <span className="text-slate-500 dark:text-slate-600 text-xs ml-1 font-normal">(comma separated)</span>
                </label>
                <input
                  value={niceToHaveSkills}
                  onChange={e => setNiceToHaveSkills(e.target.value)}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="e.g. Docker, AWS, GraphQL"
                />
                {niceToHaveSkills && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {niceToHaveSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span
                        key={s}
                        className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                  Experience Required (years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="e.g. 2"
                />
              </div>

              {/* AI Evaluation Weights */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/5 mt-2">
                <label className="text-sm text-slate-700 dark:text-slate-400 mb-3 block font-medium">
                  AI Evaluation Weights (must sum to 100)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Skills</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skillWeight}
                      onChange={e => setSkillWeight(Number(e.target.value))}
                      className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={experienceWeight}
                      onChange={e => setExperienceWeight(Number(e.target.value))}
                      className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Role Fit</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={roleFitWeight}
                      onChange={e => setRoleFitWeight(Number(e.target.value))}
                      className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm text-center"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total: {skillWeight + experienceWeight + roleFitWeight} / 100</span>
                  {skillWeight + experienceWeight + roleFitWeight !== 100 && (
                    <span className="text-xs text-red-500">Must equal 100</span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
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