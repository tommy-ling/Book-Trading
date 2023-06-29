import Link from 'next/link';

const Header = ({ currentUser }) => {
    const getHref = (href) => {
        let linkHref;
        if (href === '/books/user/[userId]') {
            linkHref = `/books/user/${currentUser.id}`;
        } else if (href === '/requests/user/[userId]') {
            linkHref = `/requests/user/${currentUser.id}`;
        } else {
            linkHref = '';
        }
        return linkHref;
    };

    const links = [
        !currentUser && { label: 'Sign up', href: '/auth/signup' },
        !currentUser && { label: 'Sign in', href: '/auth/signin' },
        currentUser && { label: 'My Books', href: '/books/user/[userId]' },
        currentUser && { label: 'My Requests', href: '/requests/user/[userId]' },
        currentUser && { label: 'My Profile', href: '/auth/profile' },
        currentUser && { label: 'Sign out', href: '/auth/signout' },
    ]
        .filter((linkConfig) => linkConfig)
        .map(({ label, href }) => {
            return (
                <li key={href} className='nav-item'>
                    <Link href={href} as={getHref(href)} className='nav-link'>
                        {label}
                    </Link>
                </li>
            );
        });

    return (
        <nav className='navbar navbar-light bg-light'>
            <div className='container-fluid'>
                <Link href='/' className='navbar-brand'>
                    Book Trading
                </Link>
                <div className='d-flex justify-content-end'>
                    <ul className='nav d-flex align-items-center'>{links}</ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
