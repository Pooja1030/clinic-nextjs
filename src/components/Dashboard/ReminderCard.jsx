import { groupByDate } from "@/utils/groupByDate";
import { FaBell, FaPills, FaStethoscope } from "react-icons/fa";

const ReminderCard = ({ reminders = [], metrics = {} }) => {
  const getColor = (type) => {
    switch (type) {
      case "follow-up": return "bg-yellow-100 text-yellow-700";
      case "medication": return "bg-green-100 text-green-700";
      case "checkup": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow-up": return <FaStethoscope />;
      case "medication": return <FaPills />;
      case "checkup": return <FaBell />;
      default: return <FaBell />;
    }
  };

  const groupedReminders = groupByDate(reminders, "remindOn");

  return (
    <div className="bg-gradient-to-br from-orange-50/70 to-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-lg flex flex-col hover:scale-[1.03] hover:shadow-2xl transition duration-500 min-h-[380px]">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaBell className="text-orange-500" /> Upcoming Reminders
      </h2>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <p className="text-sm text-gray-500">No reminders available.</p>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
          {Object.entries(groupedReminders).map(([date, items]) => (
            <div key={date}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">{date}</h4>
              {items.map((reminder, idx) => (
                <div
                  key={reminder._id || idx}
                  className="flex flex-col p-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-md border hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-md font-semibold flex items-center gap-2 text-gray-800">
                      <span className="text-xl">{getIcon(reminder.type)}</span>
                      {reminder.patientId?.name || "Unknown"}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getColor(reminder.type)}`}>
                      {reminder.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{reminder.message}</p>
                  <p className="text-xs text-gray-500">Date: {reminder.remindOn?.slice(0, 10)}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics */}
      <div className="mt-4 flex flex-wrap gap-2">
        {metrics.completionRate && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Completion: {metrics.completionRate}%
          </span>
        )}
        {metrics.avgMeds && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Avg. Meds / Script: {metrics.avgMeds}
          </span>
        )}
        {metrics.last7Days !== undefined && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Last 7 Days: {metrics.last7Days}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReminderCard;
