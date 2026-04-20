import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeeklyAppointmentsChart = ({ data }) => {
  const chartData = {
    labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    datasets: [
      {
        label: "Appointments",
        data,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { 
        grid: { display: false }, 
      },
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1 },
        suggestedMax: Math.max(...data, 3), // ensures bars are visible even if max=1
        grid: { drawTicks: false, color: "#e5e7eb" },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutCubic',
      onProgress: (animation) => {},
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default WeeklyAppointmentsChart;
