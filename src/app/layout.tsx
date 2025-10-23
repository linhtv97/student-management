import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Sinh viên",
  description: "Quản lý thông tin sinh viên, điểm số và đăng ký môn học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
