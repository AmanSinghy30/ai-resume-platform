import { useState } from 'react';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  score: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  skills: string[];
  experience: number;
  uploadedAt: string;
}

const dummyCandidates: Candidate[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', jobTitle: 'Frontend Developer', score: 87, status: 'shortlisted', skills: ['React', 'TypeScript', 'CSS'], experience: 3, uploadedAt: 'Jun 1, 2025' },
  { id: '2', name: 'Priya Mehta', email: 'priya@example.com', phone: '9123456780', jobTitle: 'Backend Developer', score: 72, status: 'reviewed', skills: ['Node.js', 'MongoDB', 'Express'], experience: 2, uploadedAt: 'Jun 2, 2025' },
  { id: '3', name: 'Amit Verma', email: 'amit@example.com', phone: '9988776655', jobTitle: 'Frontend Developer', score: 54, status: 'new', skills: ['HTML', 'CSS', 'JavaScript'], experience: 1, uploadedAt: 'Jun 3, 2025' },
  { id: '4', name: 'Sneha Patel', email: 'sneha@example.com', phone: '9871234560', jobTitle: 'UI Designer', score: null, status: 'new', skills: ['Figma', 'Adobe XD', 'CSS'], experience: 2, uploadedAt: 'Jun 4, 2025' },
  { id: '5', name: 'Karan Singh', email: 'karan@example.com', phone: '9765432100', jobTitle: 'Backend Developer', score: 41, status: 'rejected', skills: ['Python', 'Django'], experience: 1, uploadedAt: 'Jun 4, 2025' },
  { id: '6', name: 'Neha Gupta', email: 'neha@example.com', phone: '9654321001', jobTitle: 'Frontend Developer', score: 91, status: 'shortlisted', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'], experience: 4, uploadedAt: 'Jun 5, 2025' },
];

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

export default function Candidates() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <Layout title="Candidates">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Candidates</h2>
          <p className="text-sm text-gray-400 mt-1">{dummyCandidates.length} total candidates</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              List
            </button>
          </div>
          <Button variant="primary">+ Upload Resume</Button>
        </div>
      </div>
{dummyCandidates.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p className="text-5xl mb-4">📄</p>
    <h3 className="text-white font-semibold text-lg mb-2">No candidates yet</h3>
    <p className="text-gray-400 text-sm mb-6">Upload resumes to start screening candidates</p>
    <Button variant="primary">+ Upload First Resume</Button>
  </div>
)}
      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyCandidates.map((c) => (
            <Card key={c.id} className="hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  <p className="text-gray-400 text-sm">{c.email}</p>
                </div>
                <Badge label={c.status} color={statusColor[c.status]} />
              </div>
              <p className="text-gray-300 text-sm mb-3">💼 {c.jobTitle} • {c.experience} yrs</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {c.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm ${c.score === null ? 'text-gray-500' : c.score >= 80 ? 'text-green-400' : c.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {c.score !== null ? `Score: ${c.score}/100` : 'Not scored'}
                </span>
                <Button variant="ghost" className="text-xs py-1 px-3">View</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="flex flex-col gap-3">
          {dummyCandidates.map((c) => (
            <Card key={c.id} className="flex items-center justify-between hover:border-gray-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{c.name}</h3>
                  <p className="text-gray-400 text-xs">{c.email} • {c.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 flex-wrap max-w-xs">
                  {c.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{skill}</span>
                  ))}
                </div>
                <Badge label={c.status} color={statusColor[c.status]} />
                <span className={`font-bold text-sm w-20 text-right ${c.score === null ? 'text-gray-500' : c.score >= 80 ? 'text-green-400' : c.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {c.score !== null ? `${c.score}/100` : '—'}
                </span>
                <Button variant="ghost" className="text-xs py-1 px-3">View</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}