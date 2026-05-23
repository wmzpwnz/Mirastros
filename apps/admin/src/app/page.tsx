import AdminLayout from '../components/AdminLayout';
import { Card, Grid, Stack, Button, Badge } from '@mirastros-universal/design-system';

export default function DashboardPage() {
  const stats = [
    { label: 'Документов', value: '42', icon: '📚', color: 'gold' },
    { label: 'Запросов', value: '1,234', icon: '💬', color: 'turquoise' },
    { label: 'Кэш (попадания)', value: '87%', icon: '⚡', color: 'purple' },
    { label: 'Активных пользователей', value: '156', icon: '👥', color: 'gold' },
  ];

  const recentQueries = [
    { query: 'Что сегодня у Овна?', type: 'гороскоп', time: '2 мин назад' },
    { query: 'Расклад на три карты', type: 'таро', time: '5 мин назад' },
    { query: 'Интерпретация натальной карты', type: 'натальная', time: '12 мин назад' },
  ];

  return (
    <AdminLayout>
      <Stack gap="8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-cinzel text-gold mb-2">Главная</h1>
          <p className="text-silver/60">Панель администратора Mirastros</p>
        </div>

        {/* Stats Grid */}
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="6">
          {stats.map((stat) => (
            <Card key={stat.label} variant="elevated" className="hover:border-gold/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-3xl font-bold text-${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-silver/60 text-sm">{stat.label}</p>
            </Card>
          ))}
        </Grid>

        {/* Recent Queries */}
        <Card variant="elevated">
          <h2 className="text-2xl font-cinzel text-gold mb-6">Последние запросы</h2>
          <Stack gap="4">
            {recentQueries.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex-1">
                  <p className="text-silver">{item.query}</p>
                  <p className="text-xs text-silver/60 mt-1">
                    Тип: <span className="text-turquoise">{item.type}</span>
                  </p>
                </div>
                <span className="text-xs text-silver/60">{item.time}</span>
              </div>
            ))}
          </Stack>
        </Card>

        {/* Quick Actions */}
        <Grid columns={{ mobile: 1, tablet: 3 }} gap="6">
          <Card variant="elevated" className="hover:border-gold/30 cursor-pointer">
            <span className="text-3xl mb-3 block">📤</span>
            <h3 className="text-lg font-semibold text-gold mb-2">Загрузить документ</h3>
            <p className="text-sm text-silver/60">Добавить материал в базу знаний</p>
          </Card>

          <Card variant="elevated" className="hover:border-turquoise/30 cursor-pointer">
            <span className="text-3xl mb-3 block">🔍</span>
            <h3 className="text-lg font-semibold text-turquoise mb-2">Проверить RAG</h3>
            <p className="text-sm text-silver/60">Запрос к базе знаний</p>
          </Card>

          <Card variant="elevated" className="hover:border-purple/30 cursor-pointer">
            <span className="text-3xl mb-3 block">🗑️</span>
            <h3 className="text-lg font-semibold text-purple mb-2">Очистить кэш</h3>
            <p className="text-sm text-silver/60">Сбросить Redis кэш</p>
          </Card>
        </Grid>
      </Stack>
    </AdminLayout>
  );
}
