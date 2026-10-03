import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
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
      <main>
        <PageHeader path="/admin" title="관리자 로그인" />
        <section className="shell pb-20 md:pb-28">
          <div className="w-full max-w-sm">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-line">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
