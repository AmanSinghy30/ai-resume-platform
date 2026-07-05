import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import FormError from './FormError';
import { useFormValidation } from '../hooks/useFormValidation';
import toast from 'react-hot-toast';

type JobModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => Promise<void>;
  initialData?: any;
  title?: string;
  submitLabel?: string;
};

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Create New Job',
  submitLabel = 'Create Job'
}: JobModalProps) {
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState('');
  const [skillWeight, setSkillWeight] = useState(50);
  const [experienceWeight, setExperienceWeight] = useState(30);
  const [roleFitWeight, setRoleFitWeight] = useState(20);
  const [experience, setExperience] = useState('');
  const [minShortlistedScore, setMinShortlistedScore] = useState(90);
  const [minReviewedScore, setMinReviewedScore] = useState(70);

  const { errors, validate, clearError } = useFormValidation({
    jobTitle: { required: true },
    description: { required: true, minLength: 20 },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setJobTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setSkills((initialData.requiredSkills || []).join(', '));
        setNiceToHaveSkills((initialData.niceToHaveSkills || []).join(', '));
        setSkillWeight(initialData.skillWeight ?? 50);
        setExperienceWeight(initialData.experienceWeight ?? 30);
        setRoleFitWeight(initialData.roleFitWeight ?? 20);
        setExperience(initialData.experienceRequired?.toString() || '');
        setMinShortlistedScore(initialData.minShortlistedScore ?? 90);
        setMinReviewedScore(initialData.minReviewedScore ?? 70);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setJobTitle('');
    setDescription('');
    setSkills('');
    setNiceToHaveSkills('');
    setSkillWeight(50);
    setExperienceWeight(30);
    setRoleFitWeight(20);
    setExperience('');
    setMinShortlistedScore(90);
    setMinReviewedScore(70);
  };

  const handleSubmit = async () => {
    const isValid = validate({ jobTitle, description });
    if (!isValid) return;

    if (skillWeight + experienceWeight + roleFitWeight !== 100) {
      toast.error('AI Evaluation Weights must sum exactly to 100');
      return;
    }

    if (minReviewedScore >= minShortlistedScore) {
      toast.error('Shortlisted score threshold must be greater than Reviewed score threshold');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: jobTitle,
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
        minShortlistedScore,
        minReviewedScore,
      });
      // The parent component is responsible for closing the modal on success
    } catch (err: any) {
      // The parent handles error toasts, or we can handle it here if not thrown
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-sm dark:shadow-glass-lg animate-scale-in">

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-tight">{title}</h3>
          <button
            onClick={onClose}
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
              value={jobTitle}
              onChange={e => { setJobTitle(e.target.value); clearError('jobTitle'); }}
              className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="e.g. Frontend Developer"
            />
            <FormError message={errors.jobTitle} />
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

          {/* Match Score Thresholds */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/5 mt-2">
            <label className="text-sm text-slate-700 dark:text-slate-400 mb-3 block font-medium">
              Match Score Thresholds
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Shortlist Score (&ge;)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minShortlistedScore}
                  onChange={e => setMinShortlistedScore(Number(e.target.value))}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm text-center"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Review Score (&ge;)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minReviewedScore}
                  onChange={e => setMinReviewedScore(Number(e.target.value))}
                  className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm text-center"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Rejected &lt; {minReviewedScore}</span>
              {minReviewedScore >= minShortlistedScore && (
                <span className="text-xs text-red-500">Review must be &lt; Shortlist</span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : submitLabel}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
