export default function TestPage() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <h1 style={{ fontSize: '3rem' }}>✅ Страница работает!</h1>
            <p>Если вы видите это сообщение, Next.js работает правильно.</p>

            {/* Простой фон для теста */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                zIndex: 1,
                backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80)',
                backgroundSize: 'cover',
                filter: 'blur(50px)',
                opacity: 0.5
            }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
                <p style={{ fontSize: '1.5rem' }}>
                    Фон должен быть размытым звездным небом
                </p>
            </div>
        </div>
    );
}
