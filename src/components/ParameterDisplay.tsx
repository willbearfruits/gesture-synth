interface Parameter {
  label: string;
  value: number;
  unit?: string;
}

interface ParameterDisplayProps {
  parameters: Parameter[];
}

export function ParameterDisplay({ parameters }: ParameterDisplayProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {parameters.map((param, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">{param.label}</div>
          <div className="text-2xl font-bold text-white">
            {param.value.toFixed(1)}
            {param.unit && <span className="text-lg ml-1">{param.unit}</span>}
          </div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-150"
              style={{
                width: `${Math.min(100, (param.value / 1000) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
