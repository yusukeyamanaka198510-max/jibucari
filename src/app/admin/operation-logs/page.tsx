import type { Metadata } from "next";
import { OperationLogsClient } from "./OperationLogsClient";

export const metadata: Metadata = { title: "操作ログ | ジブキャリ管理" };

export default function OperationLogsPage() {
  return <OperationLogsClient />;
}
