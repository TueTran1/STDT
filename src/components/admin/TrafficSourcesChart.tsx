import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface TrafficSourceData {
  source: string
  visits: number
  percentage: number
}

interface TrafficSourcesChartProps {
  data?: TrafficSourceData[]
  loading?: boolean
  error?: string
  compact?: boolean
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({
  data,
  loading,
  error,
  compact = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {error || 'No traffic data available'}
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.source,
    value: item.visits,
    percentage: item.percentage
  }))

  const height = compact ? 200 : 300

  return (
    <div className={`w-full ${compact ? '' : 'h-80'}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${(percent ? percent * 100 : 0).toFixed(1)}%`}
            outerRadius={compact ? 60 : 100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value ? value.toLocaleString() : '0', 'Visits']}
          />
          {!compact && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
