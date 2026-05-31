import { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const dummyJobs = [
  { id: '1', title: 'Frontend Developer', description: 'Looking for React developer with TypeScript experience.', requiredSkills: ['React', 'TypeScript', 'CSS'], experienceRequired: 2, candidateCount: 8, createdAt: 'May 28, 2025' },
  { id: '2', title: 'Backend Developer', description: 'Node.js developer with MongoDB and REST API experience.', requiredSkills: ['Node.js', 'MongoDB', 'Express'], experienceRequired: 3, candidateCount: 5, createdAt: 'May 29, 2025' },
  { id: '3', title: 'UI Designer', description: 'Creative designer with Figma and prototyping skills.', requiredSkills: ['Figma', 'Adobe XD', 'CSS'], experienceRequired: 2, candidateCount: 3, createdAt: 'May 30, 2025' },
  { id: '4', title: 'Full Stack Developer', description: 'MERN stack developer for product team.', requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], experienceRequired: 4, candidateCount: 12, createdAt: 'Jun 1, 2025' },
];

export default function Jobs() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout title="Jobs">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Job Positions</h2>
          <p className="text-sm text-gray-400 mt-1">{dummyJobs.length} active positions</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Create Job</Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dummyJobs.map((job) => (
          <Card key={job.id} className="hover:border-gray-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">{job.title}</h3>
              <Badge label={`${job.candidateCount} candidates`} color="blue" />
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{job.description}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {job.requiredSkills.map((skill) => (
                <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{skill}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-xs">{job.experienceRequired}+ years exp • Created {job.createdAt}</p>
              <Button variant="ghost" className="text-xs py-1 px-3">View Details</Button>
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
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Job Title</label>
                <input className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary h-24 resize-none" placeholder="Describe the role..." />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Required Skills (comma separated)</label>
                <input className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. React, TypeScript, CSS" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Experience Required (years)</label>
                <input type="number" className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 2" />
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1">Create Job</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}