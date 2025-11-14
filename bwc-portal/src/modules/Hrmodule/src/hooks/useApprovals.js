import { useState, useEffect, useCallback } from "react";
import { approvalService } from "../services/approvalService";

// Cache configuration (same as in ApprovalManagement)
const CACHE_KEYS = {
  APPROVALS: "approvals_cache",
  TIMESTAMP: "approvals_timestamp",
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utilities
const cacheUtils = {
  getCache: () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.APPROVALS);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);

      if (!cachedData || !timestamp) return null;

      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);

      if (now - cacheTime > CACHE_DURATION) {
        cacheUtils.clearCache();
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error("Error reading cache:", error);
      cacheUtils.clearCache();
      return null;
    }
  },

  setCache: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.APPROVALS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  },

  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.APPROVALS);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },

  isCacheValid: () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return false;

      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);
      return now - cacheTime <= CACHE_DURATION;
    } catch (error) {
      return false;
    }
  },
};

export const useApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Transform HR API data to consistent frontend format
   */
  const transformApprovalData = useCallback((apiData) => {
    if (!Array.isArray(apiData)) {
      console.warn("Expected array but got:", apiData);
      return [];
    }

    return apiData.map((item) => {
      // Format request ID as T-last 5 characters
      const originalRequestId = item.travelRequestId || item.id || "unknown";
      const formattedRequestId = `T-${originalRequestId.slice(-5)}`;

      // Format dates from createdAt
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
          return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        } catch {
          return "Invalid Date";
        }
      };

      const createdDate = formatDate(item.createdAt);
      const dueDate = formatDate(item.dueDate);
      const dates =
        dueDate !== "N/A" ? `${createdDate} - ${dueDate}` : createdDate;

      return {
        id: formattedRequestId,
        travelRequestId: item.travelRequestId,
        workflowId: item.workflowId, // Make sure this is included
        type: "travel",
        title: "Travel Request Approval",
        employeeName: item.employeeName || "Unknown Employee", // Add employeeName
        employeeDepartment: item.employeeDepartment || "Unknown Department", // Add department
        purpose: item.purpose || "Travel Request", // Add purpose
        estimatedBudget: item.estimatedBudget || "$0", // Add budget
        currentStep: item.currentStep || "HR_APPROVAL", // Add currentStep
        dates: dates,
        details: "Travel request pending HR compliance check",
        status: item.status?.toLowerCase() || "pending",
        stage: item.currentStep || "HR_COMPLIENCE",
        approverRemark: item.comments || "",
        createdAt: item.createdAt,
        priority: item.priority?.toLowerCase() || "medium",
        workflowType: item.workflowType,
        currentApproverRole: item.currentApproverRole,
        nextStep: item.nextStep,
        previousStep: item.previousStep,
        estimatedCost: item.estimatedCost,
        actualCost: item.actualCost,
        isOverpriced: item.isOverpriced,
        overpricedReason: item.overpricedReason,
        dueDate: item.dueDate,
        completedAt: item.completedAt,
        _original: item,
      };
    });
  }, []);

  /**
   * Load HR pending approvals with caching support
   */
  const loadApprovals = useCallback(
    async (useCache = true) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first if allowed
        if (useCache) {
          const cachedData = cacheUtils.getCache();
          if (cachedData) {
            console.log(
              "📦 Using cached approvals data:",
              cachedData.length,
              "items"
            );
            setApprovals(cachedData);
            setLoading(false);
            return cachedData;
          }
        }

        console.log("🔄 Fetching HR pending approvals from API...");
        const apiData = await approvalService.getPendingApprovals();
        console.log("✅ HR Pending approvals raw response:", apiData);

        const transformedData = transformApprovalData(apiData);
        setApprovals(transformedData);

        // Cache the transformed data
        cacheUtils.setCache(transformedData);
        console.log("💾 Data cached successfully");

        return transformedData;
      } catch (err) {
        console.error("❌ Error loading HR approvals:", err);

        let errorMessage = err.message;

        if (err.message.includes("403")) {
          errorMessage =
            "Access denied. HR permissions required to view approval requests.";
        } else if (err.message.includes("401")) {
          errorMessage = "Session expired. Please login again.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to HR approval service. Please try again later.";
        } else if (err.message.includes("CORS")) {
          errorMessage =
            "Cannot access HR approval service due to security restrictions. Please contact administrator.";
        }

        setError(errorMessage);
        setApprovals([]);

        return [];
      } finally {
        setLoading(false);
      }
    },
    [transformApprovalData]
  );

  /**
   * Enhanced refetch that bypasses cache
   */
  const refetch = useCallback(async () => {
    console.log("🔄 Manual refetch - bypassing cache");
    return await loadApprovals(false); // Don't use cache for manual refresh
  }, [loadApprovals]);

  /**
   * Fetch workflow details for a specific request
   */
  const getWorkflowDetail = useCallback(async (workflowId) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching workflow details for:", workflowId);
      const workflowDetail = await approvalService.getWorkflowDetail(
        workflowId
      );
      console.log("✅ Workflow detail response:", workflowDetail);

      return workflowDetail;
    } catch (err) {
      console.error("❌ Error loading workflow details:", err);

      let errorMessage = err.message;

      if (err.message.includes("403")) {
        errorMessage = "Access denied. Cannot view workflow details.";
      } else if (err.message.includes("401")) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.message.includes("404")) {
        errorMessage = "Workflow details not found.";
      } else if (err.message.includes("Failed to fetch")) {
        errorMessage =
          "Unable to connect to workflow service. Please try again later.";
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve a HR request with workflow ID and cache clearing
   */
  const approveRequest = useCallback(
    async (workflowId, remarks) => {
      try {
        setLoading(true);

        // Optimistic update
        setApprovals((prev) =>
          prev.map((req) =>
            req.workflowId === workflowId
              ? { ...req, status: "approved", approverRemark: remarks }
              : req
          )
        );

        const result = await approvalService.approveRequest(
          workflowId,
          remarks
        );
        console.log("✅ HR Request approved:", result);

        // Clear cache after approval to force fresh data on next load
        cacheUtils.clearCache();
        console.log("🗑️ Cache cleared after approval");

        // Refetch without cache to get updated data
        await loadApprovals(false);

        return result;
      } catch (err) {
        // On error, clear cache and refetch to ensure data consistency
        cacheUtils.clearCache();
        await loadApprovals(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadApprovals]
  );

  /**
   * Reject a HR request with workflow ID and cache clearing
   */
  const rejectRequest = useCallback(
    async (workflowId, remarks) => {
      try {
        setLoading(true);

        // Optimistic update
        setApprovals((prev) =>
          prev.map((req) =>
            req.workflowId === workflowId
              ? { ...req, status: "rejected", approverRemark: remarks }
              : req
          )
        );

        const result = await approvalService.rejectRequest(workflowId, remarks);
        console.log("✅ HR Request rejected:", result);

        // Clear cache after rejection to force fresh data on next load
        cacheUtils.clearCache();
        console.log("🗑️ Cache cleared after rejection");

        // Refetch without cache to get updated data
        await loadApprovals(false);

        return result;
      } catch (err) {
        // On error, clear cache and refetch to ensure data consistency
        cacheUtils.clearCache();
        await loadApprovals(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadApprovals]
  );

  // Load approvals on mount with cache
  useEffect(() => {
    loadApprovals(true); // Use cache on initial load
  }, [loadApprovals]);

  return {
    // State
    approvals,
    loading,
    error,

    // Actions
    approveRequest,
    rejectRequest,
    getWorkflowDetail,
    refetch, // Use enhanced refetch that bypasses cache

    // Utilities
    clearError: () => setError(null),
    clearCache: cacheUtils.clearCache, // Expose cache clearing utility
  };
};

export default useApprovals;

//===noo===
