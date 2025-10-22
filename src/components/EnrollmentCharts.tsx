'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EnrollmentChartsProps {
  undergrad_enrollment?: number | null;
  grad_enrollment?: number | null;
  percent_male?: number | null;
  percent_female?: number | null;
  total_enrollment?: number | null;
}

export function EnrollmentCharts({
  undergrad_enrollment,
  grad_enrollment,
  percent_male,
  percent_female,
  total_enrollment
}: EnrollmentChartsProps) {
  
  // Prepare enrollment breakdown data
  const hasEnrollmentData = undergrad_enrollment && undergrad_enrollment > 0;
  const enrollmentData = hasEnrollmentData ? [
    { name: 'Undergraduate', value: undergrad_enrollment || 0, color: '#3B82F6' },
    { name: 'Graduate', value: grad_enrollment || 0, color: '#8B5CF6' }
  ].filter(item => item.value > 0) : null;

  // Prepare gender demographics data
  const hasGenderData = percent_male && percent_male > 0;
  const genderData = hasGenderData ? [
    { name: 'Male', value: Math.round((percent_male || 0) * 100), color: '#3B82F6' },
    { name: 'Female', value: Math.round((percent_female || 0) * 100), color: '#EC4899' }
  ].filter(item => item.value > 0) : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-700">
            {data.payload.name === 'Male' || data.payload.name === 'Female'
              ? `${data.value}%`
              : `${data.value.toLocaleString()} students`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data available, don't render anything
  if (!hasEnrollmentData && !hasGenderData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Demographics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Enrollment Breakdown Chart */}
        {enrollmentData && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Enrollment Breakdown
            </h3>
            {total_enrollment && (
              <p className="text-sm text-gray-600 text-center mb-2">
                Total: {total_enrollment.toLocaleString()} students
              </p>
            )}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => 
                    `${entry.name}: ${entry.value.toLocaleString()} (${(entry.percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gender Demographics Chart */}
        {genderData && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Gender Demographics
            </h3>
            <p className="text-sm text-gray-600 text-center mb-2">
              Distribution of student population
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
