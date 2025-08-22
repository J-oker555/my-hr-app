import React from 'react'

interface PieChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  title: string
}

export default function PieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center space-x-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              const previousPercentages = data
                .slice(0, index)
                .reduce((sum, d) => sum + (total > 0 ? (d.value / total) * 100 : 0), 0)
              
              const startAngle = (previousPercentages / 100) * 360
              const endAngle = ((previousPercentages + percentage) / 100) * 360
              
              const x1 = 16 + 14 * Math.cos((startAngle * Math.PI) / 180)
              const y1 = 16 + 14 * Math.sin((startAngle * Math.PI) / 180)
              const x2 = 16 + 14 * Math.cos((endAngle * Math.PI) / 180)
              const y2 = 16 + 14 * Math.sin((endAngle * Math.PI) / 180)
              
              const largeArcFlag = percentage > 50 ? 1 : 0
              
              return (
                <path
                  key={index}
                  d={`M 16 16 L ${x1} ${y1} A 14 14 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
              )
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-800">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
