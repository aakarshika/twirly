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

const OtherChart = ({ data, selectedChart }) => {
  if (!data || !data[0]) return null;

  const { aspects, items } = data[0];
  console.log('Aspects:', aspects);
  console.log('Items:', items);
  console.log('aaaaaaa',items[0].item_color_string.substring(0, items[0].item_color_string.length - 1));
  
  const chartDataRadar = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      backgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 0.2)`,
      borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
      borderWidth: 2,
      pointBackgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`
    }))
  };

  const chartDataLine = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => ({
      label: item.name,
      data: aspects.map(aspect => item.metrics[aspect.name]),
      borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
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
      backgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 0.2)`,
      borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
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
      backgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 0.2)`,
      borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };

  const chartDataBubble = {
    labels: aspects.map(aspect => (aspect.name).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')),
    datasets: items.map((item, index) => {

      const xValues = aspects.map(aspect => item.metrics[aspect.name]?.x || 0);
      const yValues = aspects.map(aspect => item.metrics[aspect.name]?.y || 0);
      const rValues = aspects.map(aspect => item.metrics[aspect.name]?.r || 0);


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
        backgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 0.2)`,
        borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
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
      backgroundColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 0.2)`,
      borderColor: item.item_color_string.substring(0,item.item_color_string.length-1) +`, 1)`,
      borderWidth: 2,
      fill: false,
      tension: 0.4
    }))
  };


  const optionsRadar = {
    responsive: true,
    maintainAspectRatio: false,
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
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const optionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const optionsPie = {
    responsive: true,
    maintainAspectRatio: false,
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
            return `${label}`;
          }
        }
      }
    }
  };

  const optionsBubble = {
    responsive: true,
    maintainAspectRatio: false,
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
    responsive: true,
    maintainAspectRatio: false,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[300px]">
          {selectedChart === 'radar' && <Radar data={chartDataRadar} options={optionsRadar} />}
          {selectedChart === 'line' && <Line data={chartDataLine} options={optionsLine} />}
          {selectedChart === 'bar' && <Bar data={chartDataBar} options={optionsBar} />}
          {selectedChart === 'pie' && <Pie data={chartDataPie} options={optionsPie} />}
          {selectedChart === 'bubble' && <Bubble data={chartDataBubble} options={optionsBubble} />}
          {selectedChart === 'polar' && <PolarArea data={chartDataPolar} options={optionsPolar} />}
        </div>
      </div>
    </div>
  );
};

export { OtherChart };
export default OtherChart; 