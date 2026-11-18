import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { House, ArrowLeft } from "@/components/ui/icons";

export default async function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-navy-200 leading-none">404</h1>
        <h2 className="text-2xl font-bold text-navy-900 mt-4">페이지를 찾을 수 없습니다.</h2>
        <p className="mt-2 text-muted-600">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="primary">
            <Link href="/">
              <House className="w-4 h-4 mr-2" />
              홈
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">
              <ArrowLeft className="w-4 h-4 mr-2" />
              문의
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
