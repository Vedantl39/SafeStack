import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { authApi } from "@/lib/auth";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ClassificationStat {
  aiActStatus: string;
  count: number;
}

interface AiModelClassification {
  id: number;
  modelName: string;
  aiActStatus: string;
}

const RISK_COLORS = {
  "Prohibited": "hsl(0, 84%, 30%)",
  "High-Risk": "hsl(0, 72%, 51%)",
  "Medium-Risk": "hsl(45, 93%, 47%)",
  "Low-Risk": "hsl(166, 76%, 37%)",
  "Unregulated": "hsl(220, 13%, 60%)"
};

export function RiskDistributionChart() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/ai-model-classifications/stats"],
  });

  const { data: classificationData } = useQuery({
    queryKey: ["/api/ai-model-classifications"],
    queryFn: async () => {
      const token = authApi.getToken();
      const response = await fetch("/api/ai-model-classifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch classifications");
      return response.json();
    },
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
          afterLabel: function(context: any) {
            if (!classificationData) return [];
            
            const riskCategory = context.label;
            const modelsInCategory = (classificationData as AiModelClassification[]).filter(
              model => model.aiActStatus === riskCategory
            );
            
            if (modelsInCategory.length === 0) return [];
            
            const lines = ['', 'Models:'];
            const maxModels = 6;
            
            modelsInCategory.slice(0, maxModels).forEach(model => {
              lines.push(`• ${model.modelName}`);
            });
            
            if (modelsInCategory.length > maxModels) {
              lines.push(`...and ${modelsInCategory.length - maxModels} more`);
            }
            
            return lines;
          }
        }
      }
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
      </div>
    );
  }

  const statsData = stats as ClassificationStat[] || [];
  
  if (statsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No AI model classifications yet</p>
          <p className="text-sm mt-1">Upload models to see risk distribution</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: statsData.map(stat => stat.aiActStatus),
    datasets: [
      {
        data: statsData.map(stat => stat.count),
        backgroundColor: statsData.map(stat => 
          RISK_COLORS[stat.aiActStatus as keyof typeof RISK_COLORS] || "hsl(220, 13%, 60%)"
        ),
        borderWidth: 2,
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
      },
    ],
  };

  return <Doughnut options={options} data={data} />;
}
