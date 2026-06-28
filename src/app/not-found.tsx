import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Không tìm thấy công cụ.</p>
      <Link href="/" className="mt-4 text-ubuntu-orange hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
