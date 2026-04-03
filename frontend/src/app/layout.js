import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SafiNia — AI-Powered Data Analysis',
  description:
    'Upload any CSV and get instant AI-powered analysis with beautiful visualizations, ML insights, and narrative summaries.',
  keywords: [
    'data analysis',
    'CSV analyzer',
    'AI visualization',
    'machine learning',
    'SafiNia',
  ],
  authors: [{ name: 'Anbadin' }],
  openGraph: {
    title: 'SafiNia — Smart Data Story Generator',
    description:
      'Upload any CSV file and watch AI turn your raw data into beautiful visualizations and insightful narratives.',
    url: 'https://safinia.vercel.app',
    siteName: 'SafiNia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafiNia — AI-Powered Data Analysis',
    description:
      'Turn CSV files into visual stories with machine learning.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}