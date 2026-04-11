import useTheme from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="sc-btn sc-btn-ghost sc-btn-icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{ fontSize: '1.15rem' }}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-stars"></i>
      ) : (
        <i className="bi bi-sun"></i>
      )}
    </button>
  );
}
