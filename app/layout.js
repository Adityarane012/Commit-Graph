import "./globals.css";

export const metadata = {
  title: "CommitGraph • AI Feature Identification from Git Commits",
  description:
    "An AI-powered prototype that identifies software features from git commit history using LLM classification. Built as part of UMLRev research on automated reverse engineering of UML models.",
  keywords: ["UMLRev", "AI", "git", "feature identification", "LLM", "software engineering", "reverse engineering"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#131318" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config={darkMode:"class",theme:{extend:{"colors":{"surface":"#131318","on-primary-container":"#0d0096","secondary-container":"#6f00be","secondary-fixed":"#f0dbff","on-surface":"#e4e1e9","surface-bright":"#39383e","primary-container":"#8083ff","inverse-surface":"#e4e1e9","secondary":"#ddb7ff","secondary-fixed-dim":"#ddb7ff","on-secondary-fixed":"#2c0051","outline-variant":"#464554","surface-container-highest":"#35343a","surface-container-lowest":"#0e0e13","surface-container-low":"#1b1b20","surface-container-high":"#2a292f","on-tertiary-fixed":"#001f26","on-tertiary-container":"#002f38","on-error":"#690005","on-error-container":"#ffdad6","on-primary-fixed-variant":"#2f2ebe","primary-fixed":"#e1e0ff","on-secondary-container":"#d6a9ff","inverse-primary":"#494bd6","tertiary-fixed-dim":"#4cd7f6","tertiary":"#4cd7f6","surface-container":"#1f1f25","background":"#131318","surface-variant":"#35343a","surface-tint":"#c0c1ff","on-background":"#e4e1e9","on-tertiary-fixed-variant":"#004e5c","on-primary":"#1000a9","on-secondary":"#490080","tertiary-fixed":"#acedff","inverse-on-surface":"#303036","primary":"#c0c1ff","outline":"#908fa0","on-secondary-fixed-variant":"#6900b3","on-tertiary":"#003640","error":"#ffb4ab","on-primary-fixed":"#07006c","surface-dim":"#131318","primary-fixed-dim":"#c0c1ff","error-container":"#93000a","on-surface-variant":"#c7c4d7"},"borderRadius":{"DEFAULT":"0.125rem","lg":"0.25rem","xl":"0.5rem","full":"0.75rem"},"spacing":{"margin-mobile":"16px","margin-desktop":"64px","max-width":"1440px","unit":"4px","gutter":"24px"},"fontFamily":{"headline-lg":["Inter"],"code-sm":["JetBrains Mono"],"label-caps":["JetBrains Mono"],"body-md":["Inter"],"headline-md":["Inter"],"body-lg":["Inter"],"display-hero":["Inter"]},"fontSize":{"headline-lg":["clamp(1.75rem, 5vw, 2.5rem)",{"lineHeight":"1.2","letterSpacing":"-0.02em","fontWeight":"700"}],"code-sm":["0.875rem",{"lineHeight":"1.5","fontWeight":"400"}],"label-caps":["0.75rem",{"lineHeight":"1","letterSpacing":"0.1em","fontWeight":"500"}],"body-md":["1rem",{"lineHeight":"1.6","fontWeight":"300"}],"headline-md":["1.5rem",{"lineHeight":"1.4","fontWeight":"500"}],"body-lg":["1.125rem",{"lineHeight":"1.6","fontWeight":"300"}],"display-hero":["clamp(2.5rem, 8vw, 4.5rem)",{"lineHeight":"1.1","letterSpacing":"-0.04em","fontWeight":"700"}]}}}}
        `}} />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
