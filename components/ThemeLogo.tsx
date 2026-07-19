export function ThemeLogo({ alt }: { alt: string }) {
  return (
    <span className="theme-logo" role="img" aria-label={alt}>
      <span className="theme-logo-image theme-logo-image-light" aria-hidden="true" />
      <span className="theme-logo-image theme-logo-image-dark" aria-hidden="true" />
    </span>
  );
}
