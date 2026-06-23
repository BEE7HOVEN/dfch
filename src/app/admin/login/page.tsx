import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero image="/images/hero-5.jpg" title="목회편지" />
        <section className="px-4 py-16 flex justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-center text-lg font-light text-[#2c2c2c] mb-6">
              관리자 로그인
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
