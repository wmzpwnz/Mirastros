import AdminLayout from '../components/AdminLayout';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Documents', value: '42', icon: '📚', color: 'gold' },
    { label: 'Total Queries', value: '1,234', icon: '💬', color: 'turquoise' },
    { label: 'Cache Hit Rate', value: '87%', icon: '⚡', color: 'purple' },
    { label: 'Active Users', value: '156', icon: '👥', color: 'gold' },
  ];

  const recentQueries = [
    { query: 'What does Aries have in store today?', type: 'horoscope', time: '2 min ago' },
    { query: 'Three card tarot spread', type: 'tarot', time: '5 min ago' },
    { query: 'Natal chart interpretation', type: 'natal', time: '12 min ago' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-cinzel text-gold mb-2">Dashboard</h1>
          <p className="text-silver/60">Welcome to Mirastros Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-6 hover:border-gold/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-3xl font-bold text-${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-silver/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Queries */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-2xl font-cinzel text-gold mb-6">Recent Queries</h2>
          <div className="space-y-4">
            {recentQueries.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex-1">
                  <p className="text-silver">{item.query}</p>
                  <p className="text-xs text-silver/60 mt-1">
                    Type: <span className="text-turquoise">{item.type}</span>
                  </p>
                </div>
                <span className="text-xs text-silver/60">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="glass rounded-xl p-6 hover:border-gold/30 transition-all text-left">
            <span className="text-3xl mb-3 block">📤</span>
            <h3 className="text-lg font-semibold text-gold mb-2">Upload Document</h3>
            <p className="text-sm text-silver/60">Add new knowledge to RAG</p>
          </button>

          <button className="glass rounded-xl p-6 hover:border-turquoise/30 transition-all text-left">
            <span className="text-3xl mb-3 block">🔍</span>
            <h3 className="text-lg font-semibold text-turquoise mb-2">Test RAG</h3>
            <p className="text-sm text-silver/60">Query the knowledge base</p>
          </button>

          <button className="glass rounded-xl p-6 hover:border-purple/30 transition-all text-left">
            <span className="text-3xl mb-3 block">🗑️</span>
            <h3 className="text-lg font-semibold text-purple mb-2">Clear Cache</h3>
            <p className="text-sm text-silver/60">Reset Redis cache</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
