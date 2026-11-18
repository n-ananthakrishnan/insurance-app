import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle } from "@/components/ui/icons";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Please verify your email address.",
  };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let status: "success" | "error" | "idle" = "idle";
  let message: string | null = null;

  if (token) {
    try {
      const res = await api.post<{ messageJa: string; messageEn: string }>("/auth/verify-email", { token });
      if (res.messageJa) {
        status = "success";
        message = res.messageJa;
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number }; data?: { error?: { messageJa?: string } } } | null;
      if (apiErr?.response?.status === 400 || apiErr?.response?.status === 404) {
        status = "error";
        message = apiErr.data?.error?.messageJa ?? "無効な確認リンクです。";
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4">
            {status === "success" ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : status === "error" ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : null}
          </div>
          <CardTitle className="text-lg">
            {status === "success"
              ? "メールアドレスの確認が完了しました"
              : status === "error"
              ? "無効な確認リンクです"
              : "メールアドレス確認"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <>
              <p className="text-muted-600 mb-6">{message ?? "登録ありがとうございます。ログインしてご利用ください。"}</p>
              <Button asChild variant="primary">
                <a href="/login">ログイン</a>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-muted-600 mb-6">{message ?? "無効な確認リンクです。再度登録を行ってください。"}</p>
              <Button asChild variant="primary">
                <a href="/register">新規登録</a>
              </Button>
            </>
          )}
          {status === "idle" && (
            <p className="text-muted-500">メールアドレス確認リンクが送信されました。リンクをクリックして確認を完了してください。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
