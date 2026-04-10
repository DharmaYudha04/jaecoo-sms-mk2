
export default function Footer(){
  return (
    <footer className="mt-20 border-t border-white/10 pt-10 pb-12 text-sm text-white/60">
      <div className="max-w-6xl mx-auto px-6 grid gap-6 md:grid-cols-3">
        <div>
          <div className="font-semibold text-white">
            JAECOO Service Management
          </div>
          <div>Yogyakarta</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>Dashboard</div>
          <div>Work Orders</div>
          <div>Service Board</div>
          <div>Customers</div>
          <div>Vehicles</div>
          <div>Schedule</div>
          <div>Reports</div>
          <div>Users</div>
        </div>

        <div className="text-right">
          © {new Date().getFullYear()} JAECOO
        </div>
      </div>
    </footer>
  )
}
