const StatCard = ({ label, value, icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="bg-gradient-to-br from-white/80 to-gray-50/70 backdrop-blur-lg ring-1 ring-gray-200 p-6 rounded-3xl shadow-lg flex items-center justify-between hover:scale-105 hover:shadow-2xl transition-transform duration-500 min-h-[140px]">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`flex items-center justify-center w-16 h-16 rounded-full shadow-md text-4xl ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
