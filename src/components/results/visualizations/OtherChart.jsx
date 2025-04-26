import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  ArcElement
} from 'chart.js';
import { Bar, Bubble, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import { COMPARISON_COLOR_SET_2 } from '../../../lib/constants';

ChartJS.register(
  RadialLinearScale,
  LinearScale,
  CategoryScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const OtherChart = ({ data }) => {
  if (!data || !data[0]) return null;

  const { aspects, items } = data[0];
  console.log('Aspects:', aspects);
  console.log('Items:', items);
  
  const chartDataRadar = {
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
      pointHoverBorderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`
    }))
  };

  const chartDataLine = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };

  const chartDataBar = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      backgroundColor: COMPARISON_COLOR_SET_2[index] +`, 0.2)`,
      borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };

  const chartDataPie = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      backgroundColor: COMPARISON_COLOR_SET_2[index] +`, 0.2)`,
      borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };

  const chartDataBubble = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => {
      console.log('Metrics for item:', item.name, item.metrics);

      const xValues = aspects.map(aspect => item.metrics[aspect.name]?.x || 0);
      const yValues = aspects.map(aspect => item.metrics[aspect.name]?.y || 0);
      const rValues = aspects.map(aspect => item.metrics[aspect.name]?.r || 0);

      console.log('xValues:', xValues);
      console.log('yValues:', yValues);
      console.log('rValues:', rValues);

      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);
      const rMin = Math.min(...rValues);
      const rMax = Math.max(...rValues);

      const normalizedData = aspects.map(aspect => ({
        x: (item.metrics[aspect.name]?.x - xMin) / (xMax - xMin) || 0,
        y: (item.metrics[aspect.name]?.y - yMin) / (yMax - yMin) || 0,
        r: ((item.metrics[aspect.name]?.r - rMin) / (rMax - rMin) || 0) * 20 // Scale radius for visibility
      }));

      return {
        label: item.name,
        data: normalizedData,
        backgroundColor: COMPARISON_COLOR_SET_2[index] +`, 0.2)`,
        borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
        borderWidth: 2,
        fill: false,
        tension: 0.4
      };
    })
  };

  const chartDataPolar = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      backgroundColor: COMPARISON_COLOR_SET_2[index] +`, 0.2)`,
      borderColor: COMPARISON_COLOR_SET_2[index] +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };


  const optionsRadar = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data[0].setTitle
      }
    }
  };

  const optionsLine = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const optionsBar = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const optionsPie = {
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data[0].setTitle
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw || 0;
            return `${label}`; // Display label and value
          }
        }
      }
    }
  };

  const optionsBubble = {
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data[0].setTitle
      }
    }
  };

  const optionsPolar = {
    scales: {
      r: {
        angleLines: {
          display: true 
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: data[0].setTitle
      }
    }
  };
  
  const [selectedChart, setSelectedChart] = useState('radar');

  useEffect(() => {
    // Cleanup function to destroy the chart instance
    return () => {
      const chartInstance = ChartJS.getChart('chartCanvasId'); // Replace 'chartCanvasId' with your actual canvas ID
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]); // Run cleanup when data changes

  return (
    <div>
      <div className="flex justify-center mb-4">
        {['radar', 'line', 'bar', 'pie', 'bubble', 'polar'].map((item) => (
          <button
            key={item}
            onClick={() => setSelectedChart(item)}
            className={`px-4 py-2 rounded-md ${selectedChart === item ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {selectedChart === 'radar' && <Radar data={chartDataRadar} options={optionsRadar} />}
        {selectedChart === 'line' && <Line data={chartDataLine} options={optionsLine} />}
        {selectedChart === 'bar' && <Bar data={chartDataBar} options={optionsBar} />}
        {selectedChart === 'pie' && <Pie data={chartDataPie} options={optionsPie} />}
        {selectedChart === 'bubble' && <Bubble data={chartDataBubble} options={optionsBubble} />}
        {selectedChart === 'polar' && <PolarArea data={chartDataPolar} options={optionsPolar} />}
      </div>
    </div>
  );
};

export default OtherChart; 