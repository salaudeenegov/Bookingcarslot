import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DailyActivityChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Vehicles Parked',
        data: chartData.data,
        backgroundColor: 'rgba(251, 191, 36, 0.6)', 
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Parking Activity (Last 7 Days)',
        font: {
          size: 18,
        },
        padding: {
          bottom: 20,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
           
            stepSize: 1, 
            precision: 0
        },
        grid: {
            color: 'rgba(200, 200, 200, 0.2)'
        }
      },
      x: {
        grid: {
            display: false
        }
      }
    },
  };

  return (
    <div className="relative h-96">
      <Bar options={options} data={data} />
    </div>
  );
};

export default DailyActivityChart;