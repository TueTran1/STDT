import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GrowthDataPoint {
  date: string
  users: number
  newUsers: number
}

interface UserGrowthChartProps {
  data?: GrowthDataPoint[]
  loading?: boolean
  error?: string
  compact?: boolean
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
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
        {error || 'No growth data available'}
      </div>
    )
  }

  const height = compact ? 200 : 300

  return (
    <div className={`w-full ${compact ? '' : 'h-80'}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: compact ? 10 : 12 }}
            interval={compact ? 'preserveStartEnd' : undefined}
          />
          <YAxis tick={{ fontSize: compact ? 10 : 12 }} />
          <Tooltip 
            formatter={(value) => [value ? value.toLocaleString() : '0', '']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ r: compact ? 2 : 4 }}
            name="Total Users"
          />
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ r: compact ? 2 : 4 }}
            name="New Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
