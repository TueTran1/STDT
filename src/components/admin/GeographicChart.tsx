import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GeographicData {
  country: string
  visits: number
  percentage: number
}

interface GeographicChartProps {
  data?: GeographicData[]
  loading?: boolean
  error?: string
}

export const GeographicChart: React.FC<GeographicChartProps> = ({
  data,
  loading,
  error
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
        {error || 'No geographic data available'}
      </div>
    )
  }

  // Sort by visits and take top 10
  const chartData = data
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
    .map(item => ({
      country: item.country,
      visits: item.visits,
      percentage: item.percentage
    }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="country" type="category" width={80} />
          <Tooltip 
            formatter={(value) => [value ? value.toLocaleString() : '0', 'Visits']}
            labelFormatter={(label) => `Country: ${label}`}
          />
          <Bar dataKey="visits" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
