import { useState, useEffect } from 'react'; // ✅ Fix 1: Added useEffect
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useFormValidation } from '../hooks/useFormValidation';
import FormError from '../components/FormError';
import { createJob, getJobs } from '../services/jobService';
import toast from 'react-hot-toast';

export default function Jobs() {
  // ✅ Fix 2: All hooks INSIDE the component
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');

  const { errors, validate, clearError } = useFormValidation({
    title: { required: true },
    description: { required: true, minLength: 20 },
  });

  // ✅ Fix 3: Fetch real jobs on mount
  useEffect(() => {
    getJobs().then(data => setJobs(data.jobs)).catch(() => {});
  }, []);

  // ✅ Fix 4: Real handleCreateJob function
  const handleCreateJob = async () => {
    const isValid = validate({ title, description });
    if (!isValid) return;

    setLoading(true);
    try {
      await createJob({
        title,
        description,
        requiredSkills: skills,
        experienceRequired: Number(experience) || 0,
      });
      toast.success('Job created!');
      setShowModal(false);
      setTitle('');
      setDescription('');
      setSkills('');
      setExperience('');
      const data = await getJobs();
      setJobs(data.jobs);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Jobs">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Job Positions</h2>
          {/* ✅ Fix 5: Use real jobs.length not dummyJobs */}
          <p className="text-sm text-gray-400 mt-1">{jobs.length} active positions</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Job
        </Button>
      </div>

      {/* ✅ Fix 6: Empty state using real jobs array */}
      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">💼</p>
          <h3 className="text-white font-semibold text-lg mb-2">No jobs posted yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Create your first job position to start receiving applications
          </p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create First Job
          </Button>
        </div>
      )}

      {/* ✅ Fix 7: Jobs Grid using real jobs array */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card key={job._id} className="hover:border-gray-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">{job.title}</h3>
              <Badge label={`${job.candidateCount ?? 0} candidates`} color="blue" />
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {job.description}
            </p>
            <div className="flex flex-wrap gap-1 mb-4">
              {(job.requiredSkills || []).map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs">
                {job.experienceRequired}+ years exp • Created {job.createdAt}
              </p>
              <Button variant="ghost" className="text-xs py-1 px-3">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">Create New Job</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">

              {/* ✅ Fix 8: Title input connected to state + FormError */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Job Title *</label>
                <input
                  value={title}
                  onChange={e => { setTitle(e.target.value); clearError('title'); }}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. Frontend Developer"
                />
                <FormError message={errors.title} /> {/* ✅ Added */}
              </div>

              {/* ✅ Fix 9: Description textarea connected to state + FormError */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description *</label>
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); clearError('description'); }}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-24 resize-none"
                  placeholder="Describe the role..."
                />
                <FormError message={errors.description} /> {/* ✅ Added */}
              </div>

              {/* ✅ Fix 10: Skills input connected to state */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Required Skills (comma separated)
                </label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. React, TypeScript, CSS"
                />
              </div>

              {/* ✅ Fix 11: Experience input connected to state */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Experience Required (years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. 2"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                {/* ✅ Fix 12: Button connected to handleCreateJob with loading state */}
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateJob}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}