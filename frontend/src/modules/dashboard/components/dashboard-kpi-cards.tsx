
export function DashboardKPI() {
  const items = [
    { label: 'Antrian', color: 'bg-blue-100' },
    { label: 'Proses Servis', color: 'bg-yellow-100' },
    { label: 'Siap Test Drive', color: 'bg-purple-100' },
    { label: 'Selesai', color: 'bg-green-100' },
    { label: 'Diambil', color: 'bg-gray-200' },
    { label: 'Terkendala', color: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className={`p-4 rounded-xl ${item.color}`}>
          <div className="text-sm">{item.label}</div>
          <div className="text-xl font-bold">0</div>
        </div>
      ))}
    </div>
  );
}
