import Layout from '../components/Layout';
import Card from '../components/Card';

export default function Activity() {
  return (
    <Layout title="Activity">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Activity Log</h2>
        <p className="text-gray-400 text-sm mt-1">Track all recruiter actions</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <h3 className="text-white font-semibold text-lg mb-2">Activity logs coming in Week 3</h3>
          <p className="text-gray-400 text-sm">Every action will be tracked here automatically</p>
        </div>
      </Card>
    </Layout>
  );
}