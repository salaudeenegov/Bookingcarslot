import React from 'react'

function StatCard({ icon, title, value, color }) {
  return (

  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-all hover:shadow-xl hover:scale-105">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-4xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`text-5xl ${color}`}>
      {icon}
    </div>
  </div>

  )
}

export default StatCard