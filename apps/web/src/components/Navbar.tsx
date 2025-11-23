import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link href="/services" className="nav-item">УСЛУГИ <span className="plus">+</span></Link>
                <Link href="/archive" className="nav-item">АРХИВ</Link>
                <Link href="/pdf" className="nav-item">PDF</Link>
            </div>
            <div className="nav-center">
                <Link href="/" className="logo">MIRASTROS</Link>
            </div>
            <div className="nav-right">
                <Link href="/about" className="nav-item">О НАС</Link>
                <Link href="/contacts" className="nav-item">КОНТАКТЫ</Link>
            </div>
        </nav>
    );
};
