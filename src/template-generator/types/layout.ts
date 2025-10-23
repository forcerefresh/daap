export enum LayoutReviewStatus {
  NOT_REVIEWED = "NOT_REVIEWED",
  REJECTED = "REJECTED",
  REJECTED_PENDING_DELETION = "REJECTED_PENDING_DELETION",
  ACCEPTED_GOOD = "ACCEPTED_GOOD",
  ACCEPTED_EXCELLENT = "ACCEPTED_EXCELLENT",
}

export const layoutReviewStatusOptions = [
  { label: "Reject", value: LayoutReviewStatus.REJECTED },
  { label: "Good", value: LayoutReviewStatus.ACCEPTED_GOOD },
  { label: "Excellent", value: LayoutReviewStatus.ACCEPTED_EXCELLENT },
];
