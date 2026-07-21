import { z } from "zod";

// ─── Auth ──────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, "用户名至少 2 个字符")
      .max(20, "用户名最多 20 个字符")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "用户名只能包含字母、数字和下划线"
      ),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z.string().min(6, "密码至少 6 个字符"),
    confirmPassword: z.string(),
    nativeLanguage: z.string().min(1, "请选择母语"),
    learningLanguage: z.string().min(1, "请选择学习语言"),
    level: z.string().min(1, "请选择当前水平"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

// ─── Profile ───────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().max(50, "显示名最多 50 个字符").optional(),
  bio: z.string().max(500, "简介最多 500 个字符").optional(),
  nativeLanguage: z.string().optional(),
  learningLanguage: z.string().optional(),
  level: z.string().optional(),
});

// ─── Post ───────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().max(200, "标题最多 200 个字符").optional(),
  content: z.string().min(1, "请输入内容").max(3000, "内容最多 3000 个字符"),
  sourceLanguage: z.string().min(1, "请选择源语言"),
  targetLanguage: z.string().min(1, "请选择目标语言"),
  expressionType: z.string().min(1, "请选择表达类型"),
  tone: z.string().min(1, "请选择语气"),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  completeness: z.enum(["COMPLETE", "PARTIAL", "IDEA_ONLY"]),
});

// ─── Types ──────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
