import Layout from '../components/Layout';
import Card from '../components/Card';

export default function Rankings() {
  return (
    <Layout title="Rankings">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Candidate Rankings</h2>
        <p className="text-gray-400 text-sm mt-1">AI-powered ranking by job fit score</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl mb-4">🏆</p>
          <h3 className="text-white font-semibold text-lg mb-2">Rankings coming in Week 4</h3>
          <p className="text-gray-400 text-sm">AI integration will rank candidates automatically</p>
        </div>
      </Card>
    </Layout>
  );
}