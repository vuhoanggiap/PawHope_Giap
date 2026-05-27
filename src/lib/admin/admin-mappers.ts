import { formatApiDate, formatApiDateTime, toNumber } from "@/lib/api/format";
import type { PetResDto } from "@/lib/api/mappers";
import type { RescueReportResDto } from "@/lib/api/mappers";
import type { KennelResDto } from "@/lib/api/kennels-api";
import type { ExpenseResDto } from "@/lib/api/expenses-api";
import type { EmailLogResDto } from "@/lib/api/email-logs-api";
import type { PetMedicalRecordResDto, PetStatusLogResDto } from "@/lib/api/pet-records-api";
import type { VolunteerApplicationResDto } from "@/lib/api/volunteer-applications-api";
import type { AdoptionMeetingResDto } from "@/lib/api/adoption-meetings-api";
import type { AdoptionHandoverResDto } from "@/lib/api/adoption-handovers-api";
import type { AdoptionFollowupResDto } from "@/lib/api/adoption-followups-api";
import type {
  ShiftResDto,
  VolunteerScheduleResDto,
  VolunteerScheduleWindowResDto,
} from "@/lib/api/volunteer-schedule-api";
import type { AdoptionResDto } from "@/lib/api/mappers";
import type { OrderResDto } from "@/lib/api/mappers";
import type { DonationResDto, DonationCampaignResDto } from "@/lib/api/mappers";
import type { ItemDonationResDto } from "@/lib/api/mappers";
import type { NotificationResDto } from "@/lib/api/mappers";
import type { UserResDto } from "@/lib/api/mappers";

export type AdminRescueRow = {
  report_id: number;
  tracking_code: string;
  user_id: number | null;
  reporter_name: string;
  reporter_phone: string;
  location_text: string;
  urgency_level: string;
  injury_type: string;
  temperament: string;
  behavior: string;
  additional_note?: string;
  image_url?: string;
  status: string;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
};

export function mapAdminRescue(dto: RescueReportResDto & { reportId?: number }): AdminRescueRow {
  return {
    report_id: dto.reportId ?? 0,
    tracking_code: dto.trackingCode,
    user_id: dto.userId ?? null,
    reporter_name: dto.reporterName,
    reporter_phone: dto.reporterPhone,
    location_text: dto.locationText,
    urgency_level: dto.urgencyLevel,
    injury_type: dto.injuryType,
    temperament: dto.temperament,
    behavior: dto.behavior,
    additional_note: dto.additionalNote,
    image_url: dto.imageUrl,
    status: dto.status,
    assigned_to: dto.assignedTo ?? null,
    created_at: formatApiDateTime(dto.createdAt),
    updated_at: formatApiDateTime(dto.updatedAt),
  };
}

export function mapAdminPet(dto: PetResDto) {
  const personality =
    typeof dto.personality === "string" && dto.personality
      ? dto.personality.split(",").map((s) => s.trim())
      : [];
  return {
    pet_id: dto.petId,
    pet_code: dto.petCode ?? `PET-${dto.petId}`,
    name: dto.name,
    species: dto.species,
    breed: dto.breed ?? "",
    gender: dto.gender,
    age_months: dto.ageMonths ?? 0,
    weight_kg: toNumber(dto.weightKg),
    personality,
    status: dto.status,
    health_status: dto.healthStatus ?? "",
    kennel_id: dto.kennelId ?? null,
    from_report_id: dto.fromReportId ?? null,
    intake_date: formatApiDate(dto.intakeDate as string | undefined),
    description: dto.description ?? "",
    image_url: dto.imageUrl ?? "",
  };
}

export function mapAdminKennel(dto: KennelResDto) {
  return {
    kennel_id: dto.kennelId,
    name: dto.name,
    capacity: dto.capacity,
    description: dto.description ?? "",
  };
}

export function mapAdminAdoption(
  dto: AdoptionResDto,
  ctx?: { petName?: string; applicantName?: string; applicantEmail?: string; applicantPhone?: string }
) {
  return {
    adoption_id: dto.adoptionId,
    application_code: dto.applicationCode,
    pet_id: dto.petId,
    pet_name: ctx?.petName ?? `Pet #${dto.petId}`,
    user_id: dto.userId,
    applicant_name: ctx?.applicantName ?? `User #${dto.userId}`,
    applicant_email: ctx?.applicantEmail ?? "",
    applicant_phone: ctx?.applicantPhone ?? "",
    applicant_address: dto.applicantAddress ?? "",
    housing_type: dto.housingType ?? "",
    has_pet_experience: dto.hasPetExperience ?? false,
    current_pets: dto.currentPets ?? "",
    working_schedule: dto.workingSchedule ?? "",
    reason: dto.reason ?? "",
    family_agreement: dto.familyAgreement ?? false,
    financial_commitment: dto.financialCommitment ?? false,
    apply_date: formatApiDate(dto.applyDate as string | undefined),
    status: dto.status,
    priority_level: dto.priorityLevel ?? "MEDIUM",
    review_status: dto.reviewStatus ?? "NORMAL",
    missing_info_note: dto.missingInfoNote ?? "",
    adoption_fee: toNumber(dto.adoptionFee),
    payment_method: dto.paymentMethod ?? "PAYPAL",
    payment_status: dto.paymentStatus ?? "UNPAID",
    paid_at: dto.paidAt ? formatApiDateTime(String(dto.paidAt)) : null,
    notes: dto.notes ?? "",
    processed_by: dto.processedBy ?? null,
    reviewed_at: dto.reviewedAt ? formatApiDateTime(String(dto.reviewedAt)) : null,
  };
}

export function mapAdminOrder(dto: OrderResDto, customer?: { name: string; email: string }) {
  return {
    order_id: dto.orderId,
    user_id: dto.userId,
    customer_name: customer?.name ?? `User #${dto.userId}`,
    customer_email: customer?.email ?? "",
    subtotal_amount: toNumber(dto.subtotalAmount),
    shipping_fee: toNumber(dto.shippingFee),
    total_amount: toNumber(dto.totalAmount),
    payment_method: dto.paymentMethod,
    payment_status: dto.paymentStatus,
    order_status: dto.orderStatus,
    shipping_address: dto.shippingAddress,
    receiver_name: dto.receiverName,
    receiver_phone: dto.receiverPhone,
    note: dto.note ?? "",
    created_at: formatApiDate(dto.createdAt as string | undefined),
    updated_at: formatApiDateTime(dto.updatedAt),
  };
}

export function mapAdminDonation(dto: DonationResDto) {
  return {
    donation_id: dto.donationId,
    campaign_id: dto.campaignId,
    donor_name: dto.donorNameManual ?? "Guest",
    user_id: dto.userId ?? null,
    amount: toNumber(dto.amount),
    payment_method: dto.paymentMethod ?? "PAYPAL",
    payment_status: dto.paymentStatus,
    donation_type: dto.donationType ?? "DONATE",
    received_at: formatApiDate(dto.receivedAt as string | undefined),
  };
}

export function mapAdminCampaign(dto: DonationCampaignResDto, raised = 0) {
  return {
    campaign_id: dto.campaignId,
    title: dto.title,
    target_amount: toNumber(dto.targetAmount),
    start_date: formatApiDate(dto.startDate),
    end_date: formatApiDate(dto.endDate),
    status: dto.status,
    raised_amount: raised,
  };
}

export function mapAdminItemDonation(dto: ItemDonationResDto) {
  return {
    item_donation_id: dto.itemDonationId,
    donor_name: dto.donorNameManual ?? "",
    item_name: dto.itemName,
    category: dto.category ?? "OTHER",
    quantity: dto.quantity ?? "1",
    status: dto.status ?? "PENDING",
    received_by: dto.receivedBy ? String(dto.receivedBy) : null,
    note: dto.note ?? "",
    received_at: formatApiDate(dto.receivedAt as string | undefined),
  };
}

export function mapAdminExpense(dto: ExpenseResDto, staffName: string) {
  return {
    expense_id: dto.expenseId,
    category: dto.category,
    description: dto.description,
    amount: toNumber(dto.amount),
    expense_date: formatApiDate(dto.expenseDate),
    receipt_image_url: dto.receiptImageUrl ?? "",
    recorded_by: staffName,
    created_at: formatApiDateTime(dto.createdAt),
  };
}

export function mapAdminUser(dto: UserResDto) {
  return {
    user_id: dto.userId,
    username: dto.username,
    full_name: dto.full_name,
    email: dto.email,
    phone: dto.phone ?? "",
    role: "USER",
    status: dto.status === false ? 0 : 1,
    created_at: "",
  };
}

export function mapAdminVolunteerApp(dto: VolunteerApplicationResDto) {
  return {
    application_id: dto.applicationId,
    user_id: dto.userId ?? null,
    full_name: dto.fullName,
    email: dto.email,
    phone: dto.phone,
    date_of_birth: formatApiDate(dto.dateOfBirth),
    address: dto.address ?? "",
    occupation: dto.occupation ?? "",
    skills: dto.skills ?? "",
    experience_with_animals: dto.experienceWithAnimals ?? "",
    reason_to_join: dto.reasonToJoin ?? "",
    available_days: dto.availableDays ? dto.availableDays.split(",") : [],
    preferred_tasks: dto.preferredTasks ? dto.preferredTasks.split(",") : [],
    has_transport: dto.hasTransport ?? false,
    status: dto.status,
    reviewed_by: dto.reviewedBy ?? null,
    reviewed_at: dto.reviewedAt ? formatApiDateTime(String(dto.reviewedAt)) : null,
    rejection_reason: dto.rejectionReason ?? "",
    applied_at: formatApiDate(dto.appliedAt as string | undefined),
  };
}

export function mapAdminNotification(dto: NotificationResDto) {
  return {
    noti_id: dto.notiId,
    user_id: dto.userId,
    message: dto.message,
    type: dto.type,
    related_id: dto.relatedId ?? 0,
    is_read: dto.isRead,
    created_at: formatApiDateTime(dto.createdAt),
  };
}

export function mapAdminEmailLog(dto: EmailLogResDto) {
  return {
    email_id: dto.emailId,
    recipient_email: dto.recipientEmail,
    recipient_name: dto.recipientName ?? "",
    subject: dto.subject,
    body: dto.body ?? "",
    email_type: dto.emailType,
    related_table: dto.relatedTable ?? "",
    related_id: dto.relatedId ?? 0,
    status: dto.status,
    error_message: dto.errorMessage ?? null,
    sent_by: dto.sentBy ?? null,
    sent_at: dto.sentAt ? formatApiDateTime(String(dto.sentAt)) : null,
    created_at: dto.sentAt ? formatApiDateTime(String(dto.sentAt)) : "",
  };
}

export function mapAdminMedical(dto: PetMedicalRecordResDto, staffName: string) {
  return {
    medical_id: dto.medicalId,
    pet_id: dto.petId,
    record_type: dto.recordType,
    record_date: formatApiDate(dto.recordDate),
    next_due_date: dto.nextDueDate ? formatApiDate(dto.nextDueDate) : null,
    description: dto.description ?? "",
    created_by: staffName,
  };
}

export function mapAdminStatusLog(dto: PetStatusLogResDto, staffName: string) {
  return {
    log_id: dto.logId,
    pet_id: dto.petId,
    old_status: dto.oldStatus ?? "",
    new_status: dto.newStatus,
    note: dto.note ?? "",
    updated_by: staffName,
    updated_at: formatApiDateTime(dto.updatedAt),
  };
}

export function mapScheduleWindow(dto: VolunteerScheduleWindowResDto) {
  return {
    window_id: dto.windowId,
    title: `Week ${formatApiDate(dto.weekStartDate)} – ${formatApiDate(dto.weekEndDate)}`,
    open_from: formatApiDateTime(dto.openAt as string | undefined),
    open_until: formatApiDateTime(dto.closeAt as string | undefined),
    week_start: formatApiDate(dto.weekStartDate),
    week_end: formatApiDate(dto.weekEndDate),
    status: dto.status,
  };
}

export function mapShift(dto: ShiftResDto) {
  return {
    shift_id: dto.shiftId,
    shift_name: dto.shiftName,
    start_time: dto.startTime?.slice(0, 5) ?? "",
    end_time: dto.endTime?.slice(0, 5) ?? "",
    description: "",
  };
}

export function mapAdminMeeting(dto: AdoptionMeetingResDto, staffName: string) {
  return {
    meeting_id: dto.meetingId,
    adoption_id: dto.adoptionId,
    staff_name: staffName,
    meeting_datetime: formatApiDateTime(dto.meetingDatetime as string | undefined),
    meeting_location: dto.meetingLocation ?? "",
    status: dto.status ?? "SCHEDULED",
    result: dto.result ?? "PENDING",
    housing_check_result: dto.housingCheckResult ?? "",
    experience_evaluation: dto.experienceEvaluation ?? "",
    note: dto.note ?? "",
  };
}

export function mapAdminHandover(dto: AdoptionHandoverResDto, handlerName: string) {
  return {
    handover_id: dto.handoverId,
    adoption_id: dto.adoptionId,
    handled_by: handlerName,
    pickup_datetime: formatApiDateTime(dto.pickupDatetime as string | undefined),
    pickup_location: dto.pickupLocation ?? "",
    handover_method: dto.handoverMethod ?? "",
    status: dto.status ?? "",
    adopter_confirmed: dto.adopterConfirmed ?? false,
    items_given: dto.itemsGiven ?? "",
    handover_photo_url: dto.handoverPhotoUrl ?? "",
    completion_note: dto.completionNote ?? "",
    completed_at: dto.completedAt ? formatApiDateTime(String(dto.completedAt)) : "",
  };
}

export function mapAdminFollowup(dto: AdoptionFollowupResDto, staffName: string) {
  return {
    followup_id: dto.followupId,
    adoption_id: dto.adoptionId,
    followup_date: formatApiDate(dto.followupDate as string | undefined),
    followup_type: dto.followupType ?? "",
    status: dto.status ?? "",
    pet_condition: dto.petCondition ?? "",
    adopter_feedback: dto.adopterFeedback ?? "",
    staff_note: dto.staffNote ?? staffName,
    next_followup_date: dto.nextFollowupDate ? formatApiDate(dto.nextFollowupDate as string) : "",
  };
}

export function mapVolunteerScheduleRow(
  dto: VolunteerScheduleResDto,
  ctx: { volunteerName: string; shiftName: string; windowId: number; weekLabel: string }
) {
  return {
    schedule_id: dto.scheduleId,
    user_id: dto.userId ?? 0,
    volunteer_name: ctx.volunteerName,
    window_id: ctx.windowId,
    week_label: ctx.weekLabel,
    shift_id: dto.shiftId ?? 0,
    shift_name: ctx.shiftName,
    status: "APPROVED",
    note: "",
  };
}
