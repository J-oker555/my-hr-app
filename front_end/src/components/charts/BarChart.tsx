import React from 'react'

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title: string
  height?: number
}

export default function BarChart({ data, title, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className={`h-6 rounded-full transition-all duration-500 ${
                  item.color || 'bg-blue-500'
                }`}
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
