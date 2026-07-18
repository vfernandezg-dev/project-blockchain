import { STATUS_LABEL, type CaseStatus } from "@/lib/api";

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <span className={`status s-${status}`}>{STATUS_LABEL[status]}</span>;
}
