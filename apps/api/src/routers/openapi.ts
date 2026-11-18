import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

const openapiDoc = {
  openapi: "3.0.3",
  info: {
    title: "SAMPLE INSURANCE JAPAN (サンプル保険ジャパン) API",
    version: "1.0.0",
    description:
      "Bilingual (Japanese JLPT N4 + English) non-life insurance REST API. " +
      "Hosted at https://api.samplese.japan (Render). Versioned under /api/v1. " +
      "All responses use { success, data, error }. Errors carry a stable `code`. " +
      "Auth: JWT access token (15 min) in Authorization: Bearer; httpOnly refresh cookie.",
    contact: { name: "SAMPLE INSURANCE JAPAN 運営事務局", email: "support@samplese.japan" },
  },
  servers: [
    { url: "/api/v1", description: "Base path for all endpoints." },
    { url: "https://api.samplese.japan/api/v1", description: "Production." },
    { url: "http://localhost:3001/api/v1", description: "Local dev." },
  ],
  tags: [
    { name: "auth", description: "ログイン/登録/セッション" },
    { name: "customers", description: "顧客プロフィール" },
    { name: "products", description: "商品・カテゴリ" },
    { name: "policies", description: "保険契約" },
    { name: "claims", description: "事故/請求" },
    { name: "documents", description: "書類（R2 署名付きURL）" },
    { name: "content", description: "ホーム/ニュース/FAQ/お問い合わせ" },
    { name: "admin", description: "管理画面（ADMIN）" },
    { name: "system", description: "ヘルス/仕様" },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token issued at /auth/login, valid 15 minutes.",
      },
    },
    schemas: {
      Envelope: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object", nullable: true },
          error: { type: "object", nullable: true },
        },
        required: ["success", "data", "error"],
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          data: { type: "null" },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "INVALID_CREDENTIALS" },
              messageJa: { type: "string", example: "メールアドレスまたはパスワードが正しくありません。" },
              messageEn: { type: "string", example: "The email or password is not correct." },
              details: { type: "object", nullable: true },
            },
            required: ["code", "messageJa", "messageEn"],
          },
        },
      },
      PaginatedEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { type: "object" } },
              total: { type: "number" },
              page: { type: "number" },
              pageSize: { type: "number" },
              totalPages: { type: "number" },
            },
          },
          error: { type: "null" },
        },
      },
      UserSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
          nameJa: { type: "string" },
          nameEn: { type: "string" },
          emailVerified: { type: "boolean" },
        },
      },
    },
    parameters: {
      Page: {
        name: "page",
        in: "query",
        description: "1-indexed page number.",
        schema: { type: "integer", minimum: 1, default: 1 },
      },
      PageSize: {
        name: "pageSize",
        in: "query",
        description: "Items per page (max 100).",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      },
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        description: "Resource UUID.",
        schema: { type: "string", format: "uuid" },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["system"],
        summary: "サーバーの状態",
        description: "Render cold-start / wake / health checks. Always anonymous.",
        operationId: "getHealth",
        responses: {
          200: {
            description: "サーバーは動作中です。",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["auth"],
        summary: "アカウント登録",
        operationId: "register",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          201: { description: "アカウントを作成しました。" },
          400: { description: "入力エラーまたはメール重複。" },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["auth"],
        summary: "メールアドレス確認",
        operationId: "verifyEmail",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" } } } } } },
        responses: { 200: { description: "確認完了。" }, 400: { description: "有効期限切れ/無効なトークン。" }, 404: { description: "トークンがありません。" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["auth"],
        summary: "ログイン",
        operationId: "login",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "ログイン成功（accessToken + refresh cookie）。" }, 401: { description: "認証失敗/アカウントロック。" }, 429: { description: "レートリミット。" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["auth"],
        summary: "トークン更新",
        description: "httpOnly refresh cookie から新しい access token を発行。",
        operationId: "refresh",
        responses: { 200: { description: "新規 access token。" }, 401: { description: "セッション無効/期限切れ。" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["auth"],
        summary: "ログアウト",
        operationId: "logout",
        responses: { 200: { description: "ログアウト完了。" } },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["auth"],
        summary: "パスワードリセット用リンク送信",
        operationId: "forgotPassword",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } } },
        responses: { 200: { description: "メール送信済み（同一のレスポンスで列挙を防止）。" } },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["auth"],
        summary: "パスワード再設定",
        operationId: "resetPassword",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, newPassword: { type: "string" } } } } } },
        responses: { 200: { description: "パスワード変更済み。" }, 400: { description: "無効/期限切れのトークン。" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["auth"],
        summary: "現在のユーザー情報",
        operationId: "getMe",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "ユーザー情報。" }, 401: { description: "未ログイン。" } },
      },
    },
    "/products": {
      get: {
        tags: ["products"],
        summary: "商品リスト（公開）",
        operationId: "listProducts",
        parameters: [{ $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { 200: { description: "商品一覧。" } },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["products"],
        summary: "商品詳細（公開）",
        operationId: "getProduct",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "商品詳細。" }, 404: { description: "見つかりません。" } },
      },
    },
    "/policies": {
      get: {
        tags: ["policies"],
        summary: "契約一覧",
        summaryJa: "契約一覧",
        operationId: "listPolicies",
        security: [{ bearerAuth: [] }],
        parameters: [ { name: "status", in: "query", schema: { type: "string" } }, { $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" } ],
        responses: { 200: { description: "契約一覧。" } },
      },
      post: {
        tags: ["policies"],
        summary: "新規契約（顧客）",
        operationId: "createPolicy",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "契約作成済み。" }, 400: { description: "入力エラー。" } },
      },
    },
    "/policies/{id}": {
      get: {
        tags: ["policies"],
        summary: "契約詳細",
        operationId: "getPolicy",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "契約詳細。" }, 404: { description: "見つかりません。" } },
      },
      patch: {
        tags: ["policies"],
        summary: "契約更新",
        operationId: "updatePolicy",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "更新済み。" }, 403: { description: "権限なし。" }, 404: { description: "見つかりません。" } },
      },
      delete: {
        tags: ["policies"],
        summary: "契約中止",
        operationId: "cancelPolicy",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "中止済み。" }, 404: { description: "見つかりません。" } },
      },
    },
    "/claims": {
      get: {
        tags: ["claims"],
        summary: "請求一覧",
        operationId: "listClaims",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "status", in: "query", schema: { type: "string" } }, { $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { 200: { description: "請求一覧。" } },
      },
      post: {
        tags: ["claims"],
        summary: "請求新規作成",
        operationId: "createClaim",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "請求作成済み。" }, 400: { description: "入力エラー。" } },
      },
    },
    "/claims/{id}": {
      get: {
        tags: ["claims"],
        summary: "請求詳細",
        operationId: "getClaim",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "請求詳細。" }, 404: { description: "見つかりません。" } },
      },
      patch: {
        tags: ["claims"],
        summary: "請求更新",
        operationId: "updateClaim",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "更新済み。" }, 403: { description: "権限なし。" }, 404: { description: "見つかりません。" } },
      },
    },
    "/claims/{id}/status": {
      post: {
        tags: ["claims"],
        summary: "請求ステータス遷移",
        description: "ALLOWED_TRANSITIONS に従う。現ステータスに応じた遷移のみ許可。",
        operationId: "transitionClaimStatus",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, commentJa: { type: "string" }, commentEn: { type: "string" } } } } } },
        responses: { 200: { description: "遷移完了。" }, 400: { description: "許可されていない遷移。" }, 404: { description: "見つかりません。" } },
      },
    },
    "/claims/{id}/documents/upload-url": {
      post: {
        tags: ["documents"],
        summary: "R2 署名付きアップロードURL発行（顧客）",
        description: "ブラウザが直接 R2 に PUT する署名付きURL。後で /confirm でDB反映。",
        operationId: "getUploadUrl",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { fileName, mimeType, sizeBytes } } } } },
        responses: { 200: { description: "署名付きURL。" }, 400: { description: "ファイル種別/サイズエラー。" }, 404: { description: "請求が見つかりません。" } },
      },
    },
    "/claims/{id}/documents": {
      post: {
        tags: ["documents"],
        summary: "署名付きURLの結果を確認しDBに登録",
        operationId: "confirmDocument",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { uploadUrlId, fileName, mimeType, sizeBytes, storageKey } } } } },
        responses: { 201: { description: "書類登録済み。" }, 400: { description: "入力エラー/URL期限切れ。" }, 404: { description: "請求が見つかりません。" } },
      },
      get: {
        tags: ["documents"],
        summary: "請求に添付された書類一覧",
        operationId: "listClaimDocuments",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "書類一覧。" }, 404: { description: "請求が見つかりません。" } },
      },
    },
    "/claims/{id}/documents/{docId}/download-url": {
      get: {
        tags: ["documents"],
        summary: "R2 署名付きダウンロードURL（所有者/管理者）",
        operationId: "getDownloadUrl",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }, { $ref: "#/components/parameters/IdParam", name: "docId" }],
        responses: { 200: { description: "署名付きダウンロードURL。" }, 403: { description: "閲覧権限なし。" }, 404: { description: "見つかりません。" } },
      },
    },
    "/news": {
      get: {
        tags: ["content"],
        summary: "ニュース一覧（公開）",
        operationId: "listNews",
        parameters: [{ $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { 200: { description: "ニュース一覧。" } },
      },
    },
    "/faq": {
      get: {
        tags: ["content"],
        summary: "よくある質問（公開）",
        operationId: "listFaq",
        parameters: [{ name: "categoryId", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "FAQ一覧。" } },
      },
    },
    "/contact": {
      post: {
        tags: ["content"],
        summary: "お問い合わせ送信",
        operationId: "sendContact",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "送信済み（匿名可）。" }, 400: { description: "入力エラー。" } },
      },
    },
    "/admin/policies": {
      post: {
        tags: ["admin"],
        summary: "契約作成（管理者）",
        operationId: "adminCreatePolicy",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "作成済み（ADMINのみ）。" }, 401: { description: "未ログイン。" }, 403: { description: "ADMINのみ。" } },
      },
    },
    "/admin/news": {
      post: {
        tags: ["admin"],
        summary: "ニュース作成（管理者）",
        operationId: "adminCreateNews",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "作成済み（ADMINのみ）。" } },
      },
      patch: {
        tags: ["admin"],
        summary: "ニュース更新（管理者）",
        operationId: "adminUpdateNews",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "更新済み。" } },
      },
      delete: {
        tags: ["admin"],
        summary: "ニュース削除（管理者・軟削除）",
        operationId: "adminDeleteNews",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "削除済み（軟削除）。" } },
      },
    },
    "/admin/faq": {
      post: {
        tags: ["admin"],
        summary: "FAQ作成（管理者）",
        operationId: "adminCreateFaq",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "作成済み。" } },
      },
    },
    "/admin/customers/{id}/notes": {
      post: {
        tags: ["admin"],
        summary: "顧客メモ追加（管理者）",
        operationId: "adminAddCustomerNote",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { noteJa: { type: "string" }, noteEn: { type: "string" } } } } } },
        responses: { 201: { description: "メモ追加済み。" }, 403: { description: "ADMINのみ。" } },
      },
      get: {
        tags: ["admin"],
        summary: "顧客メモ一覧（管理者）",
        operationId: "adminListCustomerNotes",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { 200: { description: "メモ一覧。" }, 403: { description: "ADMINのみ。" } },
      },
    },
    "/admin/claim-queue": {
      get: {
        tags: ["admin"],
        summary: "処理待ち請求一覧（管理者）",
        operationId: "adminClaimQueue",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "UPPORTED_REVIEW/MORE_DOCUMENTS_NEEDED など。" } },
      },
    },
    "/admin/audit-log": {
      get: {
        tags: ["admin"],
        summary: "監査ログ一覧（管理者）",
        operationId: "adminAuditLog",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { 200: { description: "監査ログ。" } },
      },
    },
    "/admin/notifications": {
      get: {
        tags: ["admin"],
        summary: "通知一覧（管理者）",
        operationId: "adminNotifications",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { 200: { description: "通知一覧。" } },
      },
    },
    "/openapi": {
      get: {
        tags: ["system"],
        summary: "OpenAPI仕様（JSON）",
        description: "このドキュメント自体を返すエンドポイント（人間/ツール用）。",
        operationId: "getOpenApiDoc",
        responses: { 200: { description: "OpenAPI 3.0.3 JSON。" } },
      },
    },
  },
};

router.get("/", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json(openapiDoc);
});

export { router as openapiRouter };
