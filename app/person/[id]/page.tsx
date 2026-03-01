import { prisma } from '@/lib/db';

export default async function PersonPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      allocations: {
        include: { project: true },
      },
    },
  });

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Employee not found</p>
      </div>
    );
  }

  // Parse JSON string
  let skills = [];
  let tools = [];
  let certs = [];
  try {
    const extractedSkills = typeof employee.extractedSkills === 'string'
      ? JSON.parse(employee.extractedSkills)
      : employee.extractedSkills;
    skills = extractedSkills?.skills || [];
    tools = extractedSkills?.tools || [];
    certs = extractedSkills?.certifications || [];
  } catch (e) {
    // Fallback if parsing fails
  }

  // Calculate monthly allocations
  const monthAllocations: Record<number, number> = {};
  for (const alloc of employee.allocations) {
    const startMonth = alloc.startDate.getMonth();
    const endMonth = alloc.endDate.getMonth();
    for (let m = startMonth; m <= endMonth && m < 12; m++) {
      monthAllocations[m] = (monthAllocations[m] || 0) + alloc.allocationPercent;
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
        <div className="flex gap-4 mt-4">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded font-medium">
            {employee.level}
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded font-medium">
            {employee.location}
          </span>
        </div>
      </div>

      {/* Allocation Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Allocation Timeline</h2>
        <div className="space-y-3">
          {months.map((month, idx) => {
            const alloc = monthAllocations[idx] || 0;
            const free = Math.max(0, 100 - alloc);
            return (
              <div key={month}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{month}</span>
                  <span className="text-sm font-medium text-gray-600">
                    {free}% free / {alloc}% allocated
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${alloc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Allocations */}
      {employee.allocations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Allocations</h2>
          <div className="space-y-3">
            {employee.allocations.map((alloc) => (
              <div key={alloc.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-900">{alloc.project.name}</p>
                <p className="text-sm text-gray-600">{alloc.project.clientName}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600">
                    {new Date(alloc.startDate).toLocaleDateString()} -{' '}
                    {new Date(alloc.endDate).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-gray-900">{alloc.allocationPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Expertise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Skills</h2>
          <div className="space-y-2">
            {skills.length > 0 ? (
              skills.map((skill: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-900">{skill.name}</span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    {skill.yearsOfExp} yrs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No skills listed</p>
            )}
          </div>
        </div>

        {/* Tools & Certifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tools & Certifications</h2>
          <div className="space-y-3">
            {certs.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  {certs.map((cert: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 rounded bg-purple-100 text-purple-800 text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tools.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Tools/Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 rounded bg-orange-100 text-orange-800 text-sm"
                    >
                      {typeof tool === 'string' ? tool : tool.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Resume</h2>
        <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {employee.resumeText}
        </div>
      </div>

      {/* Feedback Button */}
      <div className="text-center py-4">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Search
        </a>
      </div>
    </div>
  );
}
