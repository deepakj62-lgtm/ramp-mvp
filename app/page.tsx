export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to RAMP Staffing Search</h2>
        <p className="text-gray-600">
          This application helps you find available staff members based on their skills, availability, and experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/search" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">🔍 Search Staff</h3>
          <p className="text-gray-600 text-sm">Find available people by skills, availability window, and other criteria</p>
        </a>

        <a href="/feedback" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">📋 Feedback Board</h3>
          <p className="text-gray-600 text-sm">View and manage feature requests and bug reports</p>
        </a>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">💡 How It Works</h3>
          <p className="text-gray-600 text-sm">Search by date range and skills to find the right staff. Give feedback anywhere to help improve the system.</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Click "Search" to find available staff</li>
          <li>✓ Use the feedback button to report issues or suggest features</li>
          <li>✓ Check the Feedback Board to see what's being worked on</li>
        </ul>
      </div>
    </div>
  );
}
