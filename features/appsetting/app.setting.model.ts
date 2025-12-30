import { z } from "zod";

// 将来的にプロジェクト固有の設定が必要になる可能性があるため残している
// FFmpegパスはUser DBのAPP_SETTINGSテーブルで管理
export const AppSettingSchema = z.object({});

export type AppSetting = z.infer<typeof AppSettingSchema>;
