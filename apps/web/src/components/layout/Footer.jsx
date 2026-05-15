import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const Footer = () => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const year = new Date().getFullYear();

  return (
    <footer
      className="lg:hidden px-5 pt-6 text-center"
      style={{
        borderTop: `1px solid ${t.ink}18`,
        paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))',
        background: t.bg,
      }}
    >
      <p
        style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: t.ink, opacity: 0.45 }}
        className="mb-3"
      >
        vote. argue. repeat.
      </p>

      <div className="flex justify-center gap-5 mb-3">
        {[
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
          { label: 'Contact', href: '#' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{ fontFamily: '"Fraunces", serif', fontSize: 12, color: t.ink, opacity: 0.5, textDecoration: 'none' }}
            className="transition-opacity hover:opacity-80"
          >
            {label}
          </a>
        ))}
      </div>

      <p style={{ fontFamily: '"Fraunces", serif', fontSize: 11, color: t.ink, opacity: 0.35 }}>
        © {year} Twirly
      </p>
    </footer>
  );
};

export default Footer;
