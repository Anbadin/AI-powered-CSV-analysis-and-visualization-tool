import './globals.css';

export const metadata = {
  title: 'DataStory — Smart Data Story Generator',
  description: 'Upload any CSV file and watch AI turn your raw data into beautiful visualizations and insightful narratives.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}