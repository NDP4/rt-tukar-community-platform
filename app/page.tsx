import Link from "next/link";
import {
  Users,
  Package,
  ArrowRight,
  Shield,
  QrCode,
  Heart,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">RT Tukar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Berbagi Sesama
            <span className="text-blue-600 block">Tetangga RT</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform digital untuk warga RT berbagi makanan dan barang dengan
            tetangga. Membangun komunitas yang peduli dan saling membantu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <span>Mulai Berbagi</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50"
            >
              Sudah Punya Akun?
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa RT Tukar?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Solusi modern untuk membangun komunitas RT yang lebih peduli dan
              berkelanjutan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Komunitas RT
              </h3>
              <p className="text-gray-600">
                Terhubung dengan tetangga di RT Anda. Berbagi hanya dengan
                orang-orang terdekat yang Anda kenal.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mudah Berbagi
              </h3>
              <p className="text-gray-600">
                Posting makanan atau barang yang ingin dibagikan. Tetangga bisa
                langsung meminta dengan mudah.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                QR Code Pickup
              </h3>
              <p className="text-gray-600">
                Sistem QR code untuk pengambilan yang aman. Tidak ada
                kesalahpahaman atau masalah keamanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja RT Tukar
            </h2>
            <p className="text-lg text-gray-600">
              Proses berbagi yang sederhana dan aman
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Daftar & Gabung RT
              </h3>
              <p className="text-gray-600 text-sm">
                Buat akun dan bergabung dengan RT Anda
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posting Item
              </h3>
              <p className="text-gray-600 text-sm">
                Bagikan makanan atau barang dengan foto
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Terima Request
              </h3>
              <p className="text-gray-600 text-sm">
                Tetangga request, Anda approve dan buat jadwal
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                QR Pickup
              </h3>
              <p className="text-gray-600 text-sm">
                Scan QR code saat pengambilan untuk konfirmasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Trust */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Aman & Terpercaya
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sistem keamanan berlapis memastikan hanya warga RT yang bisa
              mengakses. Admin RT mengawasi dan mengelola semua aktivitas
              komunitas.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Membangun Komunitas RT yang Lebih Peduli?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabung sekarang dan mulai berbagi dengan tetangga Anda
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-flex items-center space-x-2"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-lg font-bold">RT Tukar</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 RT Tukar. Platform berbagi komunitas RT Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
