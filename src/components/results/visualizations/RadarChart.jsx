import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { COMPARISON_COLOR_SET_2 } from '../../../lib/constants';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const RadarChart = ({ data }) => {
  if (!data || !data[0]) return null;

  const { aspects, items } = data[0];

  const chartData = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      backgroundColor: COMPARISON_COLOR_SET_2[index] +`, 0.2)`,
      borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      borderWidth: 2,
      pointBackgroundColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
    })),
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data[0].setTitle,
      },
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default RadarChart;
