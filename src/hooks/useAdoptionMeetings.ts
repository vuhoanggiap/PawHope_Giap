import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";

// 1. Khai báo kiểu dữ liệu khớp 100% với AdoptionMeetingRes.java ở Backend
export interface AdoptionMeeting {
  meetingId: number;
  adoptionId: number;
  staffId: number;
  meetingDatetime: string;
  meetingLocation: string;
  status: string; // SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
  result: string; // PENDING, PASSED, FAILED
  housingCheckResult: string;
  experienceEvaluation: string;
  note: string;
  createdAt: string;
}

export function useAdoptionMeetings() {
  const [meetings, setMeetings] = useState<AdoptionMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy toàn bộ danh sách lịch hẹn
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdoptionMeeting[]>("/adoption_meetings");
      setMeetings(data);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật trạng thái buổi hẹn (Ví dụ: Dời lịch, Hủy lịch)
  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/adoption_meetings/${id}/status?status=${status}`, {
        method: "PATCH",
      });
      await fetchMeetings(); // Load lại danh sách sau khi sửa thành công
      return true;
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái:", e);
      return false;
    }
  };

  // Cập nhật kết quả phỏng vấn (Đậu/Rớt) kèm ghi chú
  const updateResult = async (id: number, result: string, note: string = "") => {
    try {
      // Dùng encodeURIComponent để xử lý trường hợp ghi chú có dấu cách hoặc tiếng Việt
      const safeNote = encodeURIComponent(note);
      await apiFetch(`/adoption_meetings/${id}/result?result=${result}&note=${safeNote}`, {
        method: "PATCH",
      });
      await fetchMeetings(); // Load lại danh sách
      return true;
    } catch (e) {
      console.error("Lỗi cập nhật kết quả:", e);
      return false;
    }
  };

  // Tự động load dữ liệu lần đầu tiên khi component được gọi
  useEffect(() => {
    void fetchMeetings();
  }, [fetchMeetings]);

  // Thêm hàm này vào bên trong hàm useAdoptionMeetings()
    const requestReschedule = async (id: number, proposedSlots: string) => {
    try {
      // Lưu ý: Không còn query parameter ?proposedSlots=... trên URL nữa
      await apiFetch(`/adoption_meetings/${id}/reschedule_request`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // Gửi string trực tiếp qua body
        body: JSON.stringify(proposedSlots), 
      });
      return true;
    } catch (e) {
      console.error("Lỗi gửi yêu cầu dời lịch:", e);
      return false;
    }
  };

  return { 
    meetings, 
    loading, 
    error, 
    refetch: fetchMeetings, 
    updateStatus, 
    updateResult,
    requestReschedule
  };
}